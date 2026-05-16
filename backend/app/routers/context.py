from fastapi import APIRouter

from app.models.contracts import CampaignContextRequest, CampaignContextResponse
from app.services.recommender import build_campaign_context

router = APIRouter()


@router.post("/campaign-context", response_model=CampaignContextResponse)
def create_campaign_context(request: CampaignContextRequest):
    return build_campaign_context(request)

