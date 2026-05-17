from typing import Protocol

from app.models.contracts import CampaignContextRequest, ContentApprovalRequest, ContentGenerationRequest


class CampaignRepository(Protocol):
    def get_scenarios(self) -> dict:
        ...

    def create_campaign_context(self, request: CampaignContextRequest) -> dict:
        ...

    def create_recommendations(self, context_id: str) -> dict:
        ...

    def generate_content(self, request: ContentGenerationRequest) -> dict:
        ...

    def save_content(self, response: dict) -> dict:
        ...

    def approve_content(self, request: ContentApprovalRequest) -> dict:
        ...

    def get_field_actions(self, plan_id: str) -> dict:
        ...

    def get_analytics_summary(self, plan_id: str) -> dict:
        ...

    def create_export(self, plan_id: str, export_type: str) -> dict:
        ...
