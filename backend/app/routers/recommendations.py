from fastapi import APIRouter
from pydantic import BaseModel

from app.models.contracts import RecommendationResponse
from app.services.recommender import build_recommendations

router = APIRouter()


class RecommendationRequest(BaseModel):
    context_id: str = "CTX_001"


@router.post("/recommendations", response_model=RecommendationResponse)
def create_recommendations(request: RecommendationRequest):
    return build_recommendations(request.context_id)

