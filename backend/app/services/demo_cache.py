import json
from copy import deepcopy
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parents[3]
CACHE_DIR = ROOT_DIR / "frontend" / "public" / "demo-cache"

PAYLOAD_FILES = {
    "scenarios": "scenarios.json",
    "campaign_context": "campaign-context.json",
    "recommendations": "recommendations.json",
    "content": "content-variants.json",
    "content_approval": "content-approval.json",
    "field_actions": "field-actions.json",
    "analytics": "analytics-summary.json",
    "export": "export.json",
}

_CACHE: dict[str, Any] = {}


def _load_payload(name: str) -> Any:
    with (CACHE_DIR / PAYLOAD_FILES[name]).open(encoding="utf-8") as file:
        return json.load(file)


def _ensure_cache() -> None:
    if _CACHE:
        return
    for name in PAYLOAD_FILES:
        _CACHE[name] = _load_payload(name)


def clone(data: Any) -> Any:
    return deepcopy(data)


def get_payload(name: str) -> Any:
    _ensure_cache()
    return clone(_CACHE[name])


def replace_payload(name: str, value: Any) -> None:
    _ensure_cache()
    _CACHE[name] = clone(value)


def approve_cached_content(content_id: str, approval_state: str, reviewer: str | None) -> dict[str, Any]:
    _ensure_cache()
    content = _CACHE["content"]
    selected = None
    for variant in content["variants"]:
        if variant["content_id"] == content_id:
            variant["approval_state"] = approval_state
            selected = variant
            break

    approval = clone(_CACHE["content_approval"])
    approval["content_id"] = content_id
    approval["approval_state"] = approval_state
    approval["reviewer"] = reviewer
    approval["field_actions_unlocked"] = approval_state == "approved"
    approval["approved_at"] = approval["generated_at"] if approval_state == "approved" else None
    if selected is None:
        approval["warnings"] = [f"Content id {content_id} was not found in demo cache"]
    return approval


SCENARIOS_RESPONSE = get_payload("scenarios")
SCENARIOS = SCENARIOS_RESPONSE["scenarios"]
CAMPAIGN_CONTEXT = get_payload("campaign_context")
RECOMMENDATIONS = get_payload("recommendations")
CONTENT = get_payload("content")
FIELD_ACTIONS = get_payload("field_actions")
ANALYTICS = get_payload("analytics")
EXPORT = get_payload("export")
