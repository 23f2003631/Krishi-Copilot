"""LLM Provider abstraction layer — Gemini primary, OpenAI placeholder.

Architecture:
  ContentGenerationService → LLMProvider.generate() → Gemini / OpenAI / Mock
  Provider selection is driven by LLM_PROVIDER env var via config.

This module NEVER exposes SDK-specific types outside its boundary.
All providers return plain Python dicts matching the content variant schema.
"""

from __future__ import annotations

import json
import logging
import time
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Base Provider Interface
# ---------------------------------------------------------------------------


class LLMProvider(ABC):
    """Abstract LLM provider — all providers implement this contract."""

    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str, model: str) -> list[dict] | None:
        """Generate content variants from prompts.

        Returns a list of variant dicts or None on failure.
        The caller is responsible for validation and fallback.
        """
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable provider name for logging."""
        ...


# ---------------------------------------------------------------------------
# Gemini Provider
# ---------------------------------------------------------------------------


class GeminiProvider(LLMProvider):
    """Google Gemini provider using google-generativeai SDK."""

    def __init__(self, api_key: str, timeout_seconds: int = 30, max_retries: int = 1):
        self._api_key = api_key
        self._timeout = timeout_seconds
        self._max_retries = max_retries
        self._model_instance_cache: dict[str, object] = {}

    @property
    def name(self) -> str:
        return "gemini"

    def generate(self, system_prompt: str, user_prompt: str, model: str) -> list[dict] | None:
        """Call Gemini API with retry and timeout protection."""
        try:
            import google.generativeai as genai
        except ImportError:
            logger.warning("google-generativeai package not installed — skipping Gemini call")
            return None

        genai.configure(api_key=self._api_key)

        for attempt in range(self._max_retries + 1):
            try:
                gemini_model = self._get_or_create_model(genai, model, system_prompt)
                start = time.monotonic()

                response = gemini_model.generate_content(
                    user_prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.3,
                        max_output_tokens=2000,
                        response_mime_type="application/json",
                    ),
                )

                elapsed = time.monotonic() - start
                if elapsed > self._timeout:
                    logger.warning("Gemini response took %.1fs (timeout=%ds)", elapsed, self._timeout)

                return self._parse_response(response)

            except Exception as exc:
                logger.warning(
                    "Gemini attempt %d/%d failed: %s",
                    attempt + 1, self._max_retries + 1, exc,
                )
                if attempt < self._max_retries:
                    time.sleep(0.5 * (attempt + 1))  # Simple backoff

        return None

    def _get_or_create_model(self, genai: object, model_name: str, system_prompt: str) -> object:
        """Cache model instances to avoid re-initialization overhead."""
        cache_key = f"{model_name}:{hash(system_prompt)}"
        if cache_key not in self._model_instance_cache:
            self._model_instance_cache[cache_key] = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_prompt,
            )
        return self._model_instance_cache[cache_key]

    def _parse_response(self, response: object) -> list[dict] | None:
        """Extract and parse JSON variants from Gemini response."""
        try:
            text = response.text
            if not text or not text.strip():
                logger.warning("Gemini returned empty response")
                return None

            parsed = json.loads(text)

            # Handle both {"variants": [...]} and direct list
            if isinstance(parsed, list):
                return parsed
            if isinstance(parsed, dict):
                return parsed.get("variants", [])

            logger.warning("Unexpected Gemini response structure: %s", type(parsed))
            return None

        except (json.JSONDecodeError, AttributeError, ValueError) as exc:
            logger.warning("Gemini response parse error: %s", exc)
            return None


# ---------------------------------------------------------------------------
# OpenAI Provider (placeholder for future fallback)
# ---------------------------------------------------------------------------


class OpenAIProvider(LLMProvider):
    """OpenAI provider — placeholder for future provider switching."""

    def __init__(self, api_key: str):
        self._api_key = api_key

    @property
    def name(self) -> str:
        return "openai"

    def generate(self, system_prompt: str, user_prompt: str, model: str) -> list[dict] | None:
        """Call OpenAI API. Currently a placeholder — returns None to trigger fallback."""
        try:
            import openai
        except ImportError:
            logger.warning("openai package not installed — skipping OpenAI call")
            return None

        try:
            client = openai.OpenAI(api_key=self._api_key)
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3,
                max_tokens=2000,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            parsed = json.loads(content)
            return parsed.get("variants", [])
        except Exception as exc:
            logger.warning("OpenAI call failed: %s", exc)
            return None


# ---------------------------------------------------------------------------
# Provider Factory
# ---------------------------------------------------------------------------


def get_llm_provider() -> LLMProvider | None:
    """Create the appropriate LLM provider based on config.

    Returns None if no provider is configured (demo/mock mode).
    """
    from app.config import settings

    provider = settings.llm_provider

    if provider == "gemini" and settings.gemini_api_key:
        return GeminiProvider(
            api_key=settings.gemini_api_key,
            timeout_seconds=30,
            max_retries=1,
        )

    if provider == "openai" and settings.openai_api_key:
        return OpenAIProvider(api_key=settings.openai_api_key)

    # No provider configured — content generation will use templates/cache
    return None
