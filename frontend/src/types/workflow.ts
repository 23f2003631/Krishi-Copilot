/**
 * Workflow orchestration types - mirrors backend contracts.py workflow models.
 */

export interface WorkflowStartRequest {
  scenario_id?: string;
  crop?: string;
  product?: string;
  objective?: string;
  week_start_date?: string;
  geography?: { state: string; district: string; tehsil?: string; territory_id?: string };
  audience?: { languages: string[]; device_types: string[] };
  channel_preferences?: string[];
  constraints?: { low_bandwidth: boolean; human_review_required: boolean; min_stock_cover_days: number };
  role?: string;
}

export interface WorkflowEvent {
  event_id: string;
  workflow_id: string;
  event_type: string;
  role?: string;
  timestamp: string;
  severity: string;
  description: string;
  territory?: string;
  metadata: Record<string, unknown>;
}

export interface NextBestAction {
  action: string;
  reason: string;
  assigned_role: string;
  priority: string;
  target_entity_id?: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend: string;
  metadata?: string;
  tone: string;
  source: string;
}

export interface KpiData {
  role: string;
  kpis: KpiItem[];
}

export interface OperationalEvent {
  event_id: string;
  text: string;
  time: string;
  event_type: string;
  role?: string;
  severity: string;
}

export interface SystemHealth {
  gemini: string;
  supabase: string;
  cache: string;
  data_mode: string;
  active_workflows: number;
  last_generation_source: string;
}

export interface WorkflowState {
  schema_version: string;
  request_id: string;
  generated_at: string;
  source_mode: string;
  warnings: string[];
  model_version?: string;
  trained_on?: string;
  feature_version?: string;
  data_last_updated?: string;
  inventory_snapshot?: string;
  model_last_trained?: string;
  response_time_ms?: number;
  workflow_id: string;
  plan_id: string;
  context_id: string;
  status: string;
  context: Record<string, unknown> | null;
  recommendations: Record<string, unknown>[];
  content_variants: Record<string, unknown>[];
  events: WorkflowEvent[];
  kpis: KpiData | null;
  alerts: OperationalEvent[];
  next_action: NextBestAction | null;
  system_health: SystemHealth | null;
  executive_summary?: Record<string, unknown> | null;
}
