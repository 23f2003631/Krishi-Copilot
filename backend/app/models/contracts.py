from typing import Literal

from pydantic import BaseModel, Field

Crop = Literal["wheat", "mustard", "chickpea", "potato", "cotton", "rice"]
Channel = Literal["whatsapp", "sms", "ivr", "field_rep", "retailer"]
Objective = Literal["awareness", "lead_generation", "retailer_sellthrough", "field_visit"]
RiskLevel = Literal["low", "medium", "high"]
StockStatus = Literal["healthy", "watch", "low", "out_of_stock"]
SourceMode = Literal["mock", "rules", "ml", "hybrid"]


class Geography(BaseModel):
    state: str
    district: str
    tehsil: str | None = None
    territory_id: str | None = None


class Audience(BaseModel):
    languages: list[str]
    device_types: list[str]
    max_target_count: int | None = Field(default=None, ge=1)


class Constraints(BaseModel):
    low_bandwidth: bool = True
    human_review_required: bool = True
    min_stock_cover_days: int = Field(default=10, ge=0)


class CampaignContextRequest(BaseModel):
    scenario_id: str | None = None
    crop: Crop
    product: str | None = None
    objective: Objective
    week_start_date: str
    geography: Geography
    audience: Audience
    channel_preferences: list[Channel]
    constraints: Constraints


class ApiEnvelope(BaseModel):
    schema_version: str = "syngenta-copilot.v1"
    request_id: str
    generated_at: str
    source_mode: SourceMode
    warnings: list[str] = []


class CropStage(BaseModel):
    stage: str
    days_to_stage: int
    confidence: float = Field(ge=0, le=1)


class GrowerSummary(BaseModel):
    estimated_growers: int = Field(ge=0)
    smartphone_share: float = Field(ge=0, le=1)
    keypad_share: float = Field(ge=0, le=1)
    primary_language: str


class WeatherInsight(BaseModel):
    risk_type: str
    risk_level: RiskLevel
    summary: str
    confidence: float = Field(ge=0, le=1)


class InventoryAlert(BaseModel):
    product: str
    stock_status: StockStatus
    stock_cover_days: int = Field(ge=0)
    affected_retailers: int = Field(ge=0)


class CampaignContextResponse(ApiEnvelope):
    context_id: str
    crop_stage: CropStage
    grower_summary: GrowerSummary
    weather_insights: list[WeatherInsight]
    inventory_alerts: list[InventoryAlert]


class Receptivity(BaseModel):
    open_probability: float = Field(ge=0, le=1)
    click_probability: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1)


class ChannelStrategy(BaseModel):
    channel: Channel
    rank: int = Field(ge=1)
    reason: str


class Timing(BaseModel):
    recommended_send_date: str
    send_window: str
    urgency: RiskLevel


class ExpectedImpact(BaseModel):
    baseline_click_rate: float = Field(ge=0, le=1)
    expected_click_rate: float = Field(ge=0, le=1)
    expected_leads: int = Field(ge=0)


class Recommendation(BaseModel):
    recommendation_id: str
    priority_score: int = Field(ge=0, le=100)
    segment_label: str
    target_count: int = Field(ge=0)
    crop: Crop
    product: str
    channel_strategy: list[ChannelStrategy]
    timing: Timing
    receptivity: Receptivity
    expected_impact: ExpectedImpact
    reason_codes: list[str]
    human_review_flags: list[str]
    blocked: bool = False


class RecommendationResponse(ApiEnvelope):
    plan_id: str
    context_id: str
    recommendations: list[Recommendation]


class ContentGenerationRequest(BaseModel):
    plan_id: str
    recommendation_id: str
    languages: list[str] = ["Hindi"]
    formats: list[Literal["whatsapp", "sms", "ivr", "rep_script", "visual_concept"]]
    tone: str = "trusted_advisory"


class ContentVariant(BaseModel):
    content_id: str
    format: Literal["whatsapp", "sms", "ivr", "rep_script", "visual_concept"]
    language: str
    text: str
    cta: str | None = None
    estimated_read_time_sec: int | None = Field(default=None, ge=0)
    approval_state: Literal["pending_review", "approved", "rejected"] = "pending_review"
    safety_flags: list[str] = []


class ContentGenerationResponse(ApiEnvelope):
    content_batch_id: str
    variants: list[ContentVariant]


class ContentApprovalRequest(BaseModel):
    content_id: str
    approval_state: Literal["approved", "rejected"]
    reviewer: str | None = None


class FieldAction(BaseModel):
    action_id: str
    rep_id: str
    territory_id: str
    priority: RiskLevel
    due_date: str
    action_type: str
    summary: str
    retailer_ids: list[str]
    recommended_script_id: str
    success_metric: str


class FieldActionsResponse(ApiEnvelope):
    plan_id: str
    actions: list[FieldAction]


class AnalyticsSummaryResponse(ApiEnvelope):
    plan_id: str
    kpis: dict
    charts: dict


class Scenario(BaseModel):
    scenario_id: str
    name: str
    crop: Crop
    geography: Geography
    description: str
    risk_level: RiskLevel
    stock_status: StockStatus

