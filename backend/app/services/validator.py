"""Content safety validator — banned phrases, length limits, CTA checks."""

from __future__ import annotations

from dataclasses import dataclass, field

BANNED_PHRASES: list[str] = [
    "guaranteed yield",
    "100% control",
    "use x ml",
    "spray immediately without advice",
    "definite cure",
    "will prevent all",
    "guaranteed protection",
    "complete eradication",
]

MAX_LENGTHS: dict[str, int] = {
    "sms": 160,
    "whatsapp": 480,
}

MAX_WORD_COUNTS: dict[str, int] = {
    "ivr": 90,
    "rep_script": 120,
}


@dataclass
class ValidationResult:
    passed: bool
    errors: list[str] = field(default_factory=list)


def validate_content_variant(variant: dict) -> ValidationResult:
    """Validate a single content variant dict against all safety rules."""
    errors: list[str] = []
    fmt = variant.get("format", "")
    text = variant.get("text", "") or variant.get("content_text", "")
    text_lower = text.lower()

    # --- Length checks ---
    if fmt in MAX_LENGTHS and len(text) > MAX_LENGTHS[fmt]:
        errors.append(f"{fmt.upper()} exceeds {MAX_LENGTHS[fmt]} characters (got {len(text)})")

    if fmt in MAX_WORD_COUNTS and len(text.split()) > MAX_WORD_COUNTS[fmt]:
        errors.append(f"{fmt.upper()} exceeds {MAX_WORD_COUNTS[fmt]} words (got {len(text.split())})")

    # --- Banned phrase check ---
    for phrase in BANNED_PHRASES:
        if phrase.lower() in text_lower:
            errors.append(f"Banned phrase detected: '{phrase}'")

    # --- CTA required ---
    cta = variant.get("cta")
    if not cta or not str(cta).strip():
        errors.append("Missing CTA (call-to-action)")

    # --- Approval state must be pending_review on generation ---
    approval = variant.get("approval_state", "pending_review")
    if approval != "pending_review":
        errors.append("approval_state must be 'pending_review' at generation time")

    return ValidationResult(passed=len(errors) == 0, errors=errors)


def validate_batch(variants: list[dict]) -> list[ValidationResult]:
    """Validate all variants in a content batch."""
    return [validate_content_variant(v) for v in variants]
