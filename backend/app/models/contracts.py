from typing import Literal

from pydantic import BaseModel, Field

Crop = Literal["wheat", "mustard", "chickpea", "potato", "cotton", "rice"]
Channel = Literal["whatsapp", "sms", "ivr", "field_rep", "retailer"]
Objective = Literal["awareness", "lead_generation", "retailer_sellthrough", "field_visit"]
Language = Literal["Hindi", "Punjabi", "Marathi", "Gujarati", "Kannada", "Bengali", "English"]
DeviceType = Literal["smartphone", "keypad", "unknown"]
RiskLevel = Literal["low", "medium", "high"]
StockStatus = Literal["healthy", "watch", "low", "out_of_stock"]
SourceMode = Literal["mock", "rules", "ml", "hybrid"]
ContentFormat = Literal["whatsapp", "sms", "ivr", "rep_script", "visual_concept"]
ApprovalState = Literal["pending_review", "approved", "rejected"]
Role = Literal["campaign_manager", "territory_manager", "field_rep", "retailer_support"]


class Geography(BaseModel):
    state: str
    district: str
    tehsil: str | None = None
    territory_id: str | None = None


class Audience(BaseModel):
    languages: list[Language]
    device_types: list[DeviceType]
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
    languages: list[Language] = ["Hindi"]
    formats: list[ContentFormat]
    tone: str = "trusted_advisory"


class ContentVariant(BaseModel):
    content_id: str
    format: ContentFormat
    language: Language
    text: str
    cta: str | None = None
    estimated_read_time_sec: int | None = Field(default=None, ge=0)
    approval_state: ApprovalState = "pending_review"
    safety_flags: list[str] = []
    generation_source: str | None = None
    fallback_reason: str | None = None


class ContentGenerationResponse(ApiEnvelope):
    content_batch_id: str
    plan_id: str
    recommendation_id: str
    variants: list[ContentVariant]


class ContentApprovalRequest(BaseModel):
    content_id: str
    approval_state: Literal["approved", "rejected"]
    reviewer: str | None = None


class ContentApprovalResponse(ApiEnvelope):
    content_id: str
    content_batch_id: str
    plan_id: str
    recommendation_id: str
    approval_state: ApprovalState
    reviewer: str | None = None
    approved_at: str | None = None
    field_actions_unlocked: bool


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


class ScenarioResponse(ApiEnvelope):
    scenarios: list["Scenario"]


class Scenario(BaseModel):
    scenario_id: str
    name: str
    crop: Crop
    geography: Geography
    description: str
    risk_level: RiskLevel
    stock_status: StockStatus


class ExportRequest(BaseModel):
    plan_id: str = "PLAN_001"
    export_type: Literal["csv", "whatsapp_pack", "rep_brief"] = "csv"


class ExportResponse(ApiEnvelope):
    export_id: str
    plan_id: str
    export_type: Literal["csv", "whatsapp_pack", "rep_brief"]
    formats: list[str]
    download_url: str


# ---------------------------------------------------------------------------
# Workflow Orchestration Contracts
# ---------------------------------------------------------------------------

class WorkflowStartRequest(BaseModel):
    """Request to bootstrap a full workflow chain."""
    scenario_id: str | None = None
    crop: Crop = "wheat"
    product: str = "Tilt 250 EC"
    objective: Objective = "lead_generation"
    week_start_date: str = "2026-02-16"
    geography: Geography = Geography(state="Uttar Pradesh", district="Kanpur Nagar")
    audience: Audience = Audience(languages=["Hindi"], device_types=["smartphone"])
    channel_preferences: list[Channel] = ["whatsapp", "sms", "field_rep"]
    constraints: Constraints = Constraints()
    role: Role = "campaign_manager"


class WorkflowEvent(BaseModel):
    """A single workflow lifecycle event."""
    event_id: str
    workflow_id: str
    event_type: str
    role: str | None = None
    timestamp: str
    severity: RiskLevel = "low"
    description: str
    territory: str | None = None
    metadata: dict = {}


class NextBestAction(BaseModel):
    """Recommended next action based on workflow state."""
    action: str
    reason: str
    assigned_role: str
    priority: RiskLevel
    target_entity_id: str | None = None


class KpiItem(BaseModel):
    """A single KPI metric."""
    label: str
    value: str
    trend: str
    metadata: str | None = None
    tone: str = "ai"
    source: str = "computed"


class KpiData(BaseModel):
    """Role-aware KPI collection."""
    role: str
    kpis: list[KpiItem]


class OperationalEvent(BaseModel):
    """An operational intelligence event for the live feed."""
    event_id: str
    text: str
    time: str
    event_type: str = "info"
    role: str | None = None
    severity: RiskLevel = "low"


class SystemHealth(BaseModel):
    """Backend system health snapshot."""
    gemini: str = "unknown"
    supabase: str = "unknown"
    cache: str = "unknown"
    data_mode: str = "unknown"
    active_workflows: int = 0
    last_generation_source: str = "unknown"


class WorkflowState(ApiEnvelope):
    """Complete workflow state returned by the orchestrator."""
    workflow_id: str
    plan_id: str
    context_id: str
    status: str = "active"
    context: CampaignContextResponse | None = None
    recommendations: list[Recommendation] = []
    content_variants: list[ContentVariant] = []
    events: list[WorkflowEvent] = []
    kpis: KpiData | None = None
    alerts: list[OperationalEvent] = []
    next_action: NextBestAction | None = None
    system_health: SystemHealth | None = None

