"""Content generation service — LLM orchestration + validation + fallback.

Day 2 implementation:
  - Demo cache check first
  - Provider-agnostic LLM calls (Gemini primary, OpenAI fallback)
  - Pydantic/safety validation pipeline
  - Retry once on failure → fallback to safe template
  - All outputs set to approval_state=pending_review
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from app.config import settings
from app.models.contracts import ContentApprovalRequest, ContentGenerationRequest
from app.repositories import get_repository
from app.services.validator import BANNED_PHRASES, validate_content_variant

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# System prompt (from blueprint Section 9.2)
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are Syngenta Krishi Campaign Copilot, an internal agricultural marketing assistant.
Generate concise, low-literacy-friendly campaign content for field teams.
Use ONLY the provided context and approved claims.
NEVER invent dosage, yield guarantees, disease cure promises, or regulatory claims.
All content requires human review before use.
Return ONLY valid JSON matching the provided schema."""

USER_PROMPT_TEMPLATE = """Campaign Context:
- Crop: {crop}
- Product: {product}
- Region: {state}, {district}
- Crop Stage: {stage} ({days_to_stage} days away)
- Weather Risk: {weather_summary} (risk level: {risk_level})
- Stock Status: {stock_status}, cover: {stock_cover_days} days
- Primary Language: {language}
- Channel Formats Required: {formats}

Approved Claims Only:
- This product helps protect crops during the {stage} stage
- Consult your local Syngenta representative for guidance
- Visit your nearest authorized retailer for availability

Generate content variants for each requested format.
Constraints:
- SMS: max 160 characters
- WhatsApp: max 480 characters
- IVR: max 90 words
- Rep script: max 120 words
- Tone: trusted_advisory (like a senior agronomist speaking to a farmer)
- Literacy level: low (simple words, short sentences)
- CTA: exactly one, direct action for farmer to contact local rep or retailer
- Never mention dosage
- Never guarantee outcomes
- All variants must be independent

Return ONLY this JSON, no other text:
{{
  "variants": [
    {{
      "format": "whatsapp",
      "language": "{language}",
      "text": "...",
      "cta": "...",
      "estimated_read_time_sec": 18,
      "approval_state": "pending_review",
      "safety_flags": []
    }}
  ]
}}"""

# ---------------------------------------------------------------------------
# Safe fallback templates (from blueprint Section 9.3)
# ---------------------------------------------------------------------------

SAFE_TEMPLATES: dict[tuple[str, str], dict] = {
    ("whatsapp", "Hindi"): {
        "format": "whatsapp",
        "language": "Hindi",
        "text": "आपकी फसल के इस महत्वपूर्ण समय में Syngenta आपके साथ है। अपने नजदीकी Syngenta प्रतिनिधि या रिटेलर से सही सलाह लें।",
        "cta": "प्रतिनिधि से संपर्क करें",
        "estimated_read_time_sec": 12,
        "approval_state": "pending_review",
        "safety_flags": ["template_fallback"],
    },
    ("sms", "Hindi"): {
        "format": "sms",
        "language": "Hindi",
        "text": "Syngenta: अपनी फसल की सुरक्षा के लिए आज ही स्थानीय प्रतिनिधि से संपर्क करें।",
        "cta": "संपर्क करें",
        "estimated_read_time_sec": 8,
        "approval_state": "pending_review",
        "safety_flags": ["template_fallback"],
    },
    ("ivr", "Hindi"): {
        "format": "ivr",
        "language": "Hindi",
        "text": "नमस्ते किसान भाई। आपकी फसल एक महत्वपूर्ण अवस्था में है। अपने नजदीकी Syngenta प्रतिनिधि से मिलें और सही सलाह लें।",
        "cta": "प्रतिनिधि से मिलें",
        "estimated_read_time_sec": 15,
        "approval_state": "pending_review",
        "safety_flags": ["template_fallback"],
    },
    ("rep_script", "Hindi"): {
        "format": "rep_script",
        "language": "Hindi",
        "text": "Grower से फसल अवस्था पूछें। अगर फसल critical stage के पास है तो रोग जोखिम पर सरल advisory दें। कोई dosage claim न करें। Product availability retailer से confirm कराएं।",
        "cta": "Lead confirm करें",
        "estimated_read_time_sec": 30,
        "approval_state": "pending_review",
        "safety_flags": ["template_fallback"],
    },
    ("visual_concept", "Hindi"): {
        "format": "visual_concept",
        "language": "Hindi",
        "text": "फसल सुरक्षा सलाह — अपने Syngenta प्रतिनिधि से आज ही मिलें। Simple crop illustration with product pack shot and Hindi CTA overlay.",
        "cta": "अपने प्रतिनिधि से मिलें",
        "estimated_read_time_sec": 5,
        "approval_state": "pending_review",
        "safety_flags": ["template_fallback"],
    },
    ("whatsapp", "English"): {
        "format": "whatsapp",
        "language": "English",
        "text": "Your crop is at a critical growth stage. Syngenta is here to help. Contact your nearest Syngenta representative or retailer for the right advice and product availability.",
        "cta": "Contact your local representative",
        "estimated_read_time_sec": 12,
        "approval_state": "pending_review",
        "safety_flags": ["template_fallback"],
    },
    ("sms", "English"): {
        "format": "sms",
        "language": "English",
        "text": "Syngenta: Protect your crop. Contact your local representative today for expert advice.",
        "cta": "Contact rep",
        "estimated_read_time_sec": 8,
        "approval_state": "pending_review",
        "safety_flags": ["template_fallback"],
    },
}


# ---------------------------------------------------------------------------
# Content Generation Service
# ---------------------------------------------------------------------------

class ContentGenerationService:
    """Orchestrates content generation with LLM, validation, and fallback."""

    def __init__(self):
        self._provider = None
        self._provider_initialized = False

    def generate(self, request: ContentGenerationRequest) -> dict:
        """Generate content variants for a recommendation.

        Flow: cache check → LLM call → validate → fallback if needed.
        """
        import hashlib
        repo = get_repository()
        
        # 1. Try Cache first
        cached = repo.generate_content(request)
        if cached and cached.get("variants"):
            logger.info("Cache hit for plan %s, recommendation %s", request.plan_id, request.recommendation_id)
            for v in cached["variants"]:
                v["generation_source"] = "cache"
            validated_variants = self._validate_and_fix(cached["variants"], source="cache")
            cached["variants"] = validated_variants
            # Hash fingerprinting for observability
            content_hash = hashlib.sha256(json.dumps([v.get("text", "") for v in validated_variants]).encode()).hexdigest()
            logger.info("Generated response hash: %s", content_hash)
            return cached

        logger.info("Cache miss for plan %s, recommendation %s. Calling Gemini.", request.plan_id, request.recommendation_id)
        
        fallback_reason = None
        
        # 2. Try LLM generation if API key is configured
        if settings.llm_enabled:
            try:
                variants = self._call_llm(request)
                if variants:
                    for v in variants:
                        v["generation_source"] = "gemini"
                    validated = self._validate_and_fix(variants, source="gemini")
                    response = self._build_response(request, validated, "ml")
                    
                    content_hash = hashlib.sha256(json.dumps([v.get("text", "") for v in validated]).encode()).hexdigest()
                    logger.info("Generated response hash: %s", content_hash)
                    
                    if hasattr(repo, 'save_content'):
                        try:
                            repo.save_content(response)
                        except Exception as save_exc:
                            logger.error("Persistence failed: %s", save_exc)
                            response["warnings"].append(f"Persistence failed: {save_exc}")
                            
                    return response
                else:
                    fallback_reason = "provider_returned_empty"
            except Exception as exc:
                fallback_reason = "provider_exception"
                if "quota" in str(exc).lower() or "429" in str(exc):
                    fallback_reason = "quota_limit"
                elif "timeout" in str(exc).lower():
                    fallback_reason = "timeout"
                logger.warning("LLM call failed (%s): %s — falling back to template", fallback_reason, exc)
        else:
            fallback_reason = "llm_disabled_or_demo_mode"

        # 3. Fallback to safe templates
        logger.warning("Fallback activated due to %s", fallback_reason)
        templates = self._generate_from_templates(request)
        for t in templates:
            t["generation_source"] = "fallback"
            t["fallback_reason"] = fallback_reason
            
        response = self._build_response(request, templates, "mock")
        
        content_hash = hashlib.sha256(json.dumps([v.get("text", "") for v in templates]).encode()).hexdigest()
        logger.info("Generated response hash: %s", content_hash)
        
        if hasattr(repo, 'save_content'):
            try:
                repo.save_content(response)
            except Exception as save_exc:
                logger.error("Persistence failed during fallback: %s", save_exc)
                response["warnings"].append(f"Persistence failed: {save_exc}")
            
        return response

    def _call_llm(self, request: ContentGenerationRequest) -> list[dict] | None:
        """Call LLM via provider abstraction (Gemini primary, OpenAI fallback)."""
        provider = self._get_provider()
        if provider is None:
            logger.info("No LLM provider configured — skipping LLM call")
            return None

        prompt = self._build_prompt(request)

        # Resolve model name: use gemini_model for Gemini provider, llm_model otherwise
        model = settings.gemini_model if provider.name == "gemini" else settings.llm_model

        logger.info("Calling LLM provider '%s' with model '%s'", provider.name, model)
        return provider.generate(SYSTEM_PROMPT, prompt, model)

    def _get_provider(self):
        """Lazy-init provider from factory (cached after first call)."""
        if not self._provider_initialized:
            from app.services.llm_provider import get_llm_provider
            self._provider = get_llm_provider()
            self._provider_initialized = True
        return self._provider

    def _build_prompt(self, request: ContentGenerationRequest) -> str:
        """Build user prompt from request context.

        Uses context_builder maps directly instead of calling the repository,
        which previously caused FK violations for non-seeded IDs.
        """
        from app.services.context_builder import CROP_STAGE_MAP, INVENTORY_MAP, WEATHER_RISK_MAP

        # Try to find the recommendation in the in-memory workflow store first
        rec = None
        try:
            from app.services.workflow import get_workflow_state
            wf_state = get_workflow_state(request.plan_id)
            if wf_state:
                for r in wf_state.get("recommendations", []):
                    if r.get("recommendation_id") == request.recommendation_id:
                        rec = r
                        break
        except ImportError:
            pass

        # Fallback: use the demo repository (never Supabase) for prompt context only
        if not rec:
            try:
                from app.repositories.demo import DemoRepository
                demo = DemoRepository()
                demo_response = demo.create_recommendations("CTX_001")
                for r in demo_response.get("recommendations", []):
                    if r.get("recommendation_id") == request.recommendation_id:
                        rec = r
                        break
                if not rec:
                    rec = demo_response.get("recommendations", [{}])[0] if demo_response.get("recommendations") else {}
            except Exception:
                rec = {}

        crop = rec.get("crop", "wheat")
        product = rec.get("product", "Tilt 250 EC")
        crop_stage = CROP_STAGE_MAP.get(crop, {"stage": "flowering", "days_to_stage": 3})
        weather = WEATHER_RISK_MAP.get("Kanpur Nagar", [{"summary": "General advisory", "risk_level": "low"}])
        inventory = INVENTORY_MAP.get(product, [{"stock_status": "healthy", "stock_cover_days": 15}])

        return USER_PROMPT_TEMPLATE.format(
            crop=crop,
            product=product,
            state="Uttar Pradesh",
            district="Kanpur Nagar",
            stage=crop_stage.get("stage", "flowering"),
            days_to_stage=crop_stage.get("days_to_stage", 3),
            weather_summary=weather[0].get("summary", ""),
            risk_level=weather[0].get("risk_level", "low"),
            stock_status=inventory[0].get("stock_status", "healthy"),
            stock_cover_days=inventory[0].get("stock_cover_days", 15),
            language=request.languages[0] if request.languages else "Hindi",
            formats=", ".join(request.formats),
        )

    def _validate_and_fix(self, variants: list[dict], source: str = "cache") -> list[dict]:
        """Validate variants and replace failing ones with safe fallbacks."""
        result = []
        for variant in variants:
            # Ensure required fields
            variant.setdefault("approval_state", "pending_review")
            variant.setdefault("safety_flags", [])
            variant.setdefault("content_id", f"CNT_{uuid.uuid4().hex[:8].upper()}")

            validation = validate_content_variant(variant)
            if validation.passed:
                result.append(variant)
            else:
                logger.warning("Variant failed validation: %s", validation.errors)
                fmt = variant.get("format", "whatsapp")
                lang = variant.get("language", "Hindi")
                fallback = self._get_safe_fallback(fmt, lang)
                fallback["content_id"] = variant.get("content_id", fallback.get("content_id", f"CNT_{uuid.uuid4().hex[:8].upper()}"))
                fallback["safety_flags"] = [*fallback.get("safety_flags", []), *[f"validation_error: {e}" for e in validation.errors[:2]]]
                fallback["generation_source"] = "fallback"
                fallback["fallback_reason"] = "validation_failure"
                result.append(fallback)
        return result

    def _generate_from_templates(self, request: ContentGenerationRequest) -> list[dict]:
        """Generate content from safe templates for all requested formats."""
        variants = []
        for fmt in request.formats:
            for lang in request.languages:
                template = self._get_safe_fallback(fmt, lang)
                template["content_id"] = f"CNT_{uuid.uuid4().hex[:8].upper()}"
                variants.append(template)
        return variants

    def _get_safe_fallback(self, fmt: str, language: str) -> dict:
        """Get a safe fallback template for a given format and language."""
        key = (fmt, language)
        if key in SAFE_TEMPLATES:
            return {**SAFE_TEMPLATES[key]}
        # Fall back to English version, then to generic
        eng_key = (fmt, "English")
        if eng_key in SAFE_TEMPLATES:
            template = {**SAFE_TEMPLATES[eng_key]}
            template["language"] = language
            template["safety_flags"] = ["template_fallback", "language_fallback"]
            return template
        # Absolute fallback
        return {
            "format": fmt,
            "language": language,
            "text": "Contact your nearest Syngenta representative for crop advisory.",
            "cta": "Contact representative",
            "estimated_read_time_sec": 5,
            "approval_state": "pending_review",
            "safety_flags": ["template_fallback", "generic_fallback"],
        }

    def _build_response(self, request: ContentGenerationRequest, variants: list[dict], source: str) -> dict:
        """Build a full content generation response envelope."""
        return {
            "schema_version": "syngenta-copilot.v1",
            "request_id": f"req_{uuid.uuid4().hex[:8]}",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source_mode": source,
            "warnings": [],
            "content_batch_id": f"CNT_{uuid.uuid4().hex[:6].upper()}",
            "plan_id": request.plan_id,
            "recommendation_id": request.recommendation_id,
            "variants": variants,
        }


# ---------------------------------------------------------------------------
# Module-level service instance and public API
# ---------------------------------------------------------------------------

_service = ContentGenerationService()


def generate_content(request: ContentGenerationRequest) -> dict:
    """Generate content variants — primary public API."""
    return _service.generate(request)


def approve_content(request: ContentApprovalRequest) -> dict:
    """Approve or reject content — delegates to repository."""
    return get_repository().approve_content(request)
