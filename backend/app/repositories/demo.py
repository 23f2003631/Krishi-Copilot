from app.models.contracts import CampaignContextRequest, ContentApprovalRequest, ContentGenerationRequest
from app.services.demo_cache import approve_cached_content, get_payload

BANNED_PHRASES = ["guaranteed yield", "100% control", "use x ml", "spray immediately without advice"]


class DemoRepository:
    def get_scenarios(self) -> dict:
        return get_payload("scenarios")

    def create_campaign_context(self, request: CampaignContextRequest) -> dict:
        context = get_payload("campaign_context")
        if request.scenario_id == "MUSTARD_RJ_LOW_STOCK" or request.crop == "mustard":
            context["context_id"] = "CTX_002"
            context["crop_stage"] = {"stage": "pod_formation", "days_to_stage": 2, "confidence": 0.78}
            context["grower_summary"] = {
                "estimated_growers": 980,
                "smartphone_share": 0.69,
                "keypad_share": 0.22,
                "primary_language": "Hindi",
            }
            context["weather_insights"] = [
                {
                    "risk_type": "pest_disease_window",
                    "risk_level": "medium",
                    "summary": "Mustard advisory window is active, but grower outreach should wait for stock recovery.",
                    "confidence": 0.72,
                }
            ]
            context["inventory_alerts"] = [
                {
                    "product": request.product or "Score 250 EC",
                    "stock_status": "low",
                    "stock_cover_days": 4,
                    "affected_retailers": 5,
                }
            ]
            return context

        context["inventory_alerts"][0]["product"] = request.product or context["inventory_alerts"][0]["product"]
        return context

    def create_recommendations(self, context_id: str) -> dict:
        response = get_payload("recommendations")
        response["context_id"] = context_id
        return response

    def generate_content(self, request: ContentGenerationRequest) -> dict:
        response = get_payload("content")
        response["plan_id"] = request.plan_id
        response["recommendation_id"] = request.recommendation_id
        requested_formats = set(request.formats)
        requested_languages = set(request.languages)
        response["variants"] = [
            variant
            for variant in response["variants"]
            if variant["format"] in requested_formats and variant["language"] in requested_languages
        ] or response["variants"]
        for variant in response["variants"]:
            text_lower = variant["text"].lower()
            variant["safety_flags"] = [phrase for phrase in BANNED_PHRASES if phrase in text_lower]
            variant["approval_state"] = "pending_review"
            variant["generation_source"] = "demo_cache"
        return response

    def save_content(self, response: dict) -> dict:
        return response

    def approve_content(self, request: ContentApprovalRequest) -> dict:
        return approve_cached_content(request.content_id, request.approval_state, request.reviewer)

    def get_field_actions(self, plan_id: str) -> dict:
        response = get_payload("field_actions")
        response["plan_id"] = plan_id
        return response

    def get_analytics_summary(self, plan_id: str) -> dict:
        response = get_payload("analytics")
        response["plan_id"] = plan_id
        return response

    def create_export(self, plan_id: str, export_type: str) -> dict:
        response = get_payload("export")
        response["plan_id"] = plan_id
        response["export_type"] = export_type
        return response
