from fastapi import APIRouter

from app.models.contracts import ContentApprovalRequest, ContentApprovalResponse, ContentGenerationRequest, ContentGenerationResponse
from app.services.content_generator import approve_content as approve_content_service
from app.services.content_generator import generate_content

router = APIRouter()


@router.post("/generate", response_model=ContentGenerationResponse)
def create_content(request: ContentGenerationRequest):
    return generate_content(request)


@router.post("/approve", response_model=ContentApprovalResponse)
def approve_content(request: ContentApprovalRequest):
    return approve_content_service(request)
