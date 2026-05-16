from fastapi import APIRouter

from app.models.contracts import AnalyticsSummaryResponse
from app.services.demo_cache import ANALYTICS, clone

router = APIRouter()


@router.get("/analytics-summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(plan_id: str = "PLAN_001"):
    response = clone(ANALYTICS)
    response["plan_id"] = plan_id
    return response

