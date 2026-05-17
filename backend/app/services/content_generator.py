from app.models.contracts import ContentApprovalRequest, ContentGenerationRequest
from app.repositories import get_repository

BANNED_PHRASES = ["guaranteed yield", "100% control", "use x ml", "spray immediately without advice"]


def generate_content(request: ContentGenerationRequest):
    return get_repository().generate_content(request)


def approve_content(request: ContentApprovalRequest):
    return get_repository().approve_content(request)
