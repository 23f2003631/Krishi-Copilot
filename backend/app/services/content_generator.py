from app.services.demo_cache import CONTENT, clone

BANNED_PHRASES = ["guaranteed yield", "100% control", "use x ml", "spray immediately without advice"]


def generate_content():
    response = clone(CONTENT)
    for variant in response["variants"]:
        text_lower = variant["text"].lower()
        variant["safety_flags"] = [phrase for phrase in BANNED_PHRASES if phrase in text_lower]
        variant["approval_state"] = "pending_review"
    return response

