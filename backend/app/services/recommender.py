from app.models.contracts import CampaignContextRequest
from app.services.demo_cache import CAMPAIGN_CONTEXT, RECOMMENDATIONS, clone


def build_campaign_context(request: CampaignContextRequest):
    context = clone(CAMPAIGN_CONTEXT)
    context["crop_stage"]["stage"] = "flowering" if request.crop == "wheat" else "active_window"
    context["inventory_alerts"][0]["product"] = request.product or context["inventory_alerts"][0]["product"]
    return context


def build_recommendations(context_id: str):
    response = clone(RECOMMENDATIONS)
    response["context_id"] = context_id
    return response

