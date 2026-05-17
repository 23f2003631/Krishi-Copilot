from app.models.contracts import CampaignContextRequest
from app.repositories import get_repository


def build_campaign_context(request: CampaignContextRequest):
    return get_repository().create_campaign_context(request)


def build_recommendations(context_id: str):
    return get_repository().create_recommendations(context_id)
