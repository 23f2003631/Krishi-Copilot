from fastapi import APIRouter

from app.models.contracts import AnalyticsSummaryResponse
from app.repositories import get_repository

router = APIRouter()


@router.get("/analytics-summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(plan_id: str = "PLAN_001"):
    return get_repository().get_analytics_summary(plan_id)
