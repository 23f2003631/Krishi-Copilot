export type Crop = "wheat" | "mustard" | "chickpea" | "potato" | "cotton" | "rice";
export type Channel = "whatsapp" | "sms" | "ivr" | "field_rep" | "retailer";
export type Objective = "awareness" | "lead_generation" | "retailer_sellthrough" | "field_visit";
export type Language = "Hindi" | "Punjabi" | "Marathi" | "Gujarati" | "Kannada" | "Bengali" | "English";
export type DeviceType = "smartphone" | "keypad" | "unknown";
export type RiskLevel = "low" | "medium" | "high";
export type StockStatus = "healthy" | "watch" | "low" | "out_of_stock";
export type SourceMode = "mock" | "rules" | "ml" | "hybrid";
export type ContentFormat = "whatsapp" | "sms" | "ivr" | "rep_script" | "visual_concept";
export type ApprovalState = "pending_review" | "approved" | "rejected";
export type Role = "campaign_manager" | "territory_manager" | "field_rep" | "retailer_support";

export interface ApiEnvelope {
  schema_version: "syngenta-copilot.v1";
  request_id: string;
  generated_at: string;
  source_mode?: string;
  warnings: string[];
  model_version?: string;
  trained_on?: string;
  feature_version?: string;
  data_last_updated?: string;
  inventory_snapshot?: string;
  model_last_trained?: string;
  response_time_ms?: number;
}

export interface Geography {
  state: string;
  district: string;
  tehsil?: string;
  territory_id?: string;
}

export interface CampaignContextRequest {
  scenario_id?: string;
  crop: Crop;
  product?: string;
  objective: Objective;
  week_start_date: string;
  geography: Geography;
  audience: {
    languages: Language[];
    device_types: DeviceType[];
    max_target_count?: number;
  };
  channel_preferences: Channel[];
  constraints: {
    low_bandwidth: boolean;
    human_review_required: boolean;
    min_stock_cover_days: number;
  };
}

export interface CampaignContextResponse extends ApiEnvelope {
  context_id: string;
  crop_stage: {
    stage: string;
    days_to_stage: number;
    confidence: number;
  };
  grower_summary: {
    estimated_growers: number;
    smartphone_share: number;
    keypad_share: number;
    primary_language: Language;
  };
  weather_insights: WeatherInsight[];
  inventory_alerts: InventoryAlert[];
}

export interface WeatherInsight {
  risk_type: string;
  risk_level: RiskLevel;
  summary: string;
  confidence: number;
}

export interface InventoryAlert {
  product: string;
  stock_status: StockStatus;
  stock_cover_days: number;
  affected_retailers: number;
}

export interface ExecutiveSummary {
  total_target_growers: number;
  predicted_open_rate: number;
  predicted_click_rate: number;
  expected_leads: number;
  stock_ready_retailers: number;
  summary_text: string;
}

export interface RecommendationResponse extends ApiEnvelope {
  plan_id: string;
  context_id: string;
  recommendations: Recommendation[];
  executive_summary?: ExecutiveSummary;
}

export interface DataQualityWarning {
  message: string;
  severity: "low" | "medium" | "high";
}

export interface Recommendation {
  recommendation_id: string;
  plan_id?: string;
  priority_score: number;
  segment_label: string;
  target_count: number;
  crop: Crop;
  product: string;
  channel_strategy: { channel: Channel; rank: number; reason: string }[];
  timing: {
    recommended_send_date: string | null;
    send_window: string | null;
    urgency: RiskLevel | "blocked";
  };
  receptivity: {
    open_probability: number | null;
    click_probability: number | null;
    confidence: string | null;
    confidence_label?: string;
  };
  expected_impact: {
    baseline_click_rate: number;
    expected_click_rate: number;
    expected_leads: number;
  };
  reason_codes: string[];
  human_review_flags: string[];
  blocked: boolean;
  blocked_reasons?: string[];
  actionability_status?: "Ready to Execute" | "Needs Human Review" | "Blocked";
  data_quality_warnings?: DataQualityWarning[];
  operational_readiness_score?: number;
  recommendation_priority_rank?: number;
}

export interface ContentGenerationResponse extends ApiEnvelope {
  content_batch_id: string;
  plan_id: string;
  recommendation_id: string;
  variants: ContentVariant[];
}

export interface ContentVariant {
  content_id: string;
  format: ContentFormat;
  language: Language;
  text: string;
  cta?: string;
  estimated_read_time_sec?: number;
  approval_state: ApprovalState;
  safety_flags: string[];
}

export interface ContentApprovalResponse extends ApiEnvelope {
  content_id: string;
  content_batch_id: string;
  plan_id: string;
  recommendation_id: string;
  approval_state: ApprovalState;
  reviewer?: string;
  approved_at?: string;
  field_actions_unlocked: boolean;
}

export interface FieldActionsResponse extends ApiEnvelope {
  plan_id: string;
  actions: FieldAction[];
}

export interface FieldAction {
  action_id: string;
  rep_id: string;
  territory_id: string;
  priority: RiskLevel;
  due_date: string;
  action_type: string;
  summary: string;
  retailer_ids: string[];
  recommended_script_id: string;
  success_metric: string;
}

export interface AnalyticsSummaryResponse extends ApiEnvelope {
  plan_id: string;
  kpis: {
    target_growers: number;
    predicted_open_rate: number;
    predicted_click_rate: number;
    expected_leads: number;
    stock_ready_retailers: number;
    field_actions: number;
  };
  charts: {
    channel_mix: { channel: Channel; share: number }[];
    weekly_funnel: { week: string; baseline: number; recommended: number }[];
    engagement_funnel?: { label: string; baseline: number; recommended: number }[];
  };
}

export interface ScenarioResponse extends ApiEnvelope {
  scenarios: Scenario[];
}

export interface Scenario {
  scenario_id: string;
  name: string;
  crop: Crop;
  geography: Geography;
  description: string;
  risk_level: RiskLevel;
  stock_status: StockStatus;
}

export interface ExportResponse extends ApiEnvelope {
  export_id: string;
  plan_id: string;
  export_type: "csv" | "whatsapp_pack" | "rep_brief";
  formats: string[];
  download_url: string;
}
