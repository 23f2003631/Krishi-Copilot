from fastapi import APIRouter, Request
from pydantic import BaseModel
import time

from app.models.contracts import RecommendationResponse
from app.services.recommender import build_recommendations

router = APIRouter()


class RecommendationRequest(BaseModel):
    context_id: str = "CTX_001"


@router.post("/recommendations", response_model=RecommendationResponse)
def create_recommendations(request: Request, body: RecommendationRequest):
    from fastapi import HTTPException
    if body.context_id == "CTX_ERROR" or "error" in body.context_id.lower():
        raise HTTPException(status_code=500, detail="Simulated backend database error")
        
    res = build_recommendations(body.context_id)
    start_time = getattr(request.state, "start_time", None)
    if start_time:
        res["response_time_ms"] = int((time.perf_counter() - start_time) * 1000)
    return res

