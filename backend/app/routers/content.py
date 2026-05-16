from fastapi import APIRouter

from app.models.contracts import ContentApprovalRequest, ContentGenerationRequest, ContentGenerationResponse
from app.services.content_generator import generate_content

router = APIRouter()


@router.post("/generate", response_model=ContentGenerationResponse)
def create_content(_: ContentGenerationRequest):
    return generate_content()


@router.post("/approve")
def approve_content(request: ContentApprovalRequest):
    return {
        "schema_version": "syngenta-copilot.v1",
        "request_id": "REQ_APPROVAL",
        "generated_at": "2026-05-17T10:05:00+05:30",
        "source_mode": "rules",
        "content_id": request.content_id,
        "approval_state": request.approval_state,
        "reviewer": request.reviewer,
        "warnings": [],
    }

