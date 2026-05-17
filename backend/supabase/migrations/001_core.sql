CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS campaign_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id TEXT UNIQUE NOT NULL,
  scenario_id TEXT,
  crop TEXT NOT NULL,
  product TEXT,
  objective TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  tehsil TEXT,
  territory_id TEXT,
  languages TEXT[] NOT NULL,
  device_types TEXT[] NOT NULL,
  max_target_count INT,
  channel_preferences TEXT[] NOT NULL,
  low_bandwidth BOOLEAN DEFAULT true,
  human_review_required BOOLEAN DEFAULT true,
  min_stock_cover_days INT DEFAULT 10,
  crop_stage JSONB,
  grower_summary JSONB,
  weather_insights JSONB,
  inventory_alerts JSONB,
  source_mode TEXT DEFAULT 'mock',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id TEXT UNIQUE NOT NULL,
  plan_id TEXT NOT NULL,
  context_id TEXT REFERENCES campaign_contexts(context_id),
  priority_score INT CHECK (priority_score BETWEEN 0 AND 100),
  segment_label TEXT NOT NULL,
  target_count INT NOT NULL,
  crop TEXT NOT NULL,
  product TEXT NOT NULL,
  channel_strategy JSONB NOT NULL,
  timing JSONB NOT NULL,
  receptivity JSONB NOT NULL,
  expected_impact JSONB NOT NULL,
  reason_codes TEXT[] NOT NULL,
  human_review_flags TEXT[],
  blocked BOOLEAN DEFAULT false,
  source_mode TEXT DEFAULT 'rules',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT UNIQUE NOT NULL,
  content_batch_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  recommendation_id TEXT REFERENCES recommendations(recommendation_id),
  format TEXT NOT NULL,
  language TEXT NOT NULL,
  content_text TEXT NOT NULL,
  cta TEXT,
  estimated_read_time_sec INT,
  approval_state TEXT DEFAULT 'pending_review',
  safety_flags TEXT[],
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id TEXT UNIQUE NOT NULL,
  plan_id TEXT NOT NULL,
  rep_id TEXT NOT NULL,
  territory_id TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_date DATE NOT NULL,
  action_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  retailer_ids TEXT[],
  recommended_script_id TEXT,
  success_metric TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS export_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT NOT NULL,
  export_type TEXT NOT NULL,
  storage_path TEXT,
  exported_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO campaign_contexts (
  context_id, scenario_id, crop, product, objective, week_start_date, state, district, tehsil, territory_id,
  languages, device_types, max_target_count, channel_preferences, low_bandwidth, human_review_required,
  min_stock_cover_days, crop_stage, grower_summary, weather_insights, inventory_alerts, source_mode
) VALUES
(
  'CTX_001', 'WHEAT_UP_FLOWERING_RISK', 'wheat', 'Tilt 250 EC', 'lead_generation', '2026-02-16',
  'Uttar Pradesh', 'Kanpur Nagar', 'Kanpur_Nagar_T023', 'TER_001',
  ARRAY['Hindi'], ARRAY['smartphone'], 1180, ARRAY['whatsapp','sms','field_rep'], true, true, 10,
  '{"stage":"flowering","days_to_stage":3,"confidence":0.82}'::jsonb,
  '{"estimated_growers":1180,"smartphone_share":0.74,"keypad_share":0.18,"primary_language":"Hindi"}'::jsonb,
  '[{"risk_type":"humidity_rainfall","risk_level":"high","summary":"Humidity and light rainfall raise crop-stage disease advisory priority.","confidence":0.76}]'::jsonb,
  '[{"product":"Tilt 250 EC","stock_status":"healthy","stock_cover_days":18,"affected_retailers":6}]'::jsonb,
  'hybrid'
),
(
  'CTX_002', 'MUSTARD_RJ_LOW_STOCK', 'mustard', 'Score 250 EC', 'retailer_sellthrough', '2026-02-16',
  'Rajasthan', 'Sikar', 'Sikar_T011', 'TER_021',
  ARRAY['Hindi'], ARRAY['smartphone','keypad'], 980, ARRAY['field_rep','retailer'], true, true, 10,
  '{"stage":"pod_formation","days_to_stage":2,"confidence":0.78}'::jsonb,
  '{"estimated_growers":980,"smartphone_share":0.69,"keypad_share":0.22,"primary_language":"Hindi"}'::jsonb,
  '[{"risk_type":"pest_disease_window","risk_level":"medium","summary":"Mustard advisory window is active, but grower outreach should wait for stock recovery.","confidence":0.72}]'::jsonb,
  '[{"product":"Score 250 EC","stock_status":"low","stock_cover_days":4,"affected_retailers":5}]'::jsonb,
  'hybrid'
)
ON CONFLICT (context_id) DO UPDATE SET
  inventory_alerts = EXCLUDED.inventory_alerts,
  weather_insights = EXCLUDED.weather_insights,
  grower_summary = EXCLUDED.grower_summary;

INSERT INTO recommendations (
  recommendation_id, plan_id, context_id, priority_score, segment_label, target_count, crop, product,
  channel_strategy, timing, receptivity, expected_impact, reason_codes, human_review_flags, blocked, source_mode
) VALUES
(
  'REC_001', 'PLAN_001', 'CTX_001', 91, 'Hindi smartphone wheat cohort near flowering', 860, 'wheat', 'Tilt 250 EC',
  '[{"channel":"whatsapp","rank":1,"reason":"High smartphone share"},{"channel":"field_rep","rank":2,"reason":"Trust-sensitive disease advisory"},{"channel":"sms","rank":3,"reason":"Backup for low bandwidth"}]'::jsonb,
  '{"recommended_send_date":"2026-02-18","send_window":"07:00-10:00","urgency":"high"}'::jsonb,
  '{"open_probability":0.31,"click_probability":0.08,"confidence":0.71}'::jsonb,
  '{"baseline_click_rate":0.05,"expected_click_rate":0.08,"expected_leads":69}'::jsonb,
  ARRAY['Flowering window detected','Humidity and light rainfall rising','Stock sufficiency above threshold','Hindi is primary grower language'],
  ARRAY['agronomy_review_required'], false, 'rules'
),
(
  'REC_003', 'PLAN_002', 'CTX_002', 64, 'Sikar mustard stock-gated sell-through window', 740, 'mustard', 'Score 250 EC',
  '[{"channel":"field_rep","rank":1,"reason":"Replenishment before grower blast"},{"channel":"retailer","rank":2,"reason":"Retailer stock is launch blocker"}]'::jsonb,
  '{"recommended_send_date":"2026-02-20","send_window":"Hold","urgency":"high"}'::jsonb,
  '{"open_probability":0.28,"click_probability":0.06,"confidence":0.68}'::jsonb,
  '{"baseline_click_rate":0.05,"expected_click_rate":0,"expected_leads":0}'::jsonb,
  ARRAY['Stock cover only 4 days','Sell-through outreach blocked','Rep replenishment action needed first'],
  ARRAY['stock_replenishment_required'], true, 'rules'
)
ON CONFLICT (recommendation_id) DO UPDATE SET
  priority_score = EXCLUDED.priority_score,
  expected_impact = EXCLUDED.expected_impact,
  blocked = EXCLUDED.blocked;

INSERT INTO content_variants (
  content_id, content_batch_id, plan_id, recommendation_id, format, language, content_text, cta,
  estimated_read_time_sec, approval_state, safety_flags
) VALUES
(
  'CNT_001_HI_WA', 'CNT_001', 'PLAN_001', 'REC_001', 'whatsapp', 'Hindi',
  'गेहूं की फसल फूल आने की अवस्था के पास है। नमी और हल्की बारिश के कारण रोग का जोखिम बढ़ सकता है। अपने नजदीकी Syngenta प्रतिनिधि या retailer से Tilt 250 EC की उपलब्धता और सही सलाह लें।',
  'आज ही स्थानीय प्रतिनिधि से संपर्क करें', 18, 'pending_review', ARRAY[]::TEXT[]
),
(
  'CNT_001_HI_SMS', 'CNT_001', 'PLAN_001', 'REC_001', 'sms', 'Hindi',
  'गेहूं में नमी से रोग जोखिम बढ़ सकता है। Tilt 250 EC की उपलब्धता और सही सलाह के लिए Syngenta प्रतिनिधि से संपर्क करें।',
  'प्रतिनिधि से संपर्क करें', 12, 'pending_review', ARRAY[]::TEXT[]
),
(
  'CNT_001_HI_REP', 'CNT_001', 'PLAN_001', 'REC_001', 'rep_script', 'Hindi',
  'Grower से फसल अवस्था पूछें। अगर गेहूं flowering के पास है और खेत में नमी है, तो रोग जोखिम पर सरल advisory दें। कोई dosage claim न करें। Tilt 250 EC की availability retailer से confirm कराएं।',
  'Lead confirm करें', 34, 'pending_review', ARRAY[]::TEXT[]
)
ON CONFLICT (content_id) DO NOTHING;

INSERT INTO field_actions (
  action_id, plan_id, rep_id, territory_id, priority, due_date, action_type, summary,
  retailer_ids, recommended_script_id, success_metric
) VALUES
(
  'ACT_001', 'PLAN_001', 'REP_014', 'TER_001', 'high', '2026-02-18', 'retailer_and_grower_followup',
  'Confirm Tilt 250 EC sufficiency with top retailers, then follow up with high-receptivity wheat growers.',
  ARRAY['RTL_0091','RTL_0112'], 'CNT_001_HI_REP', 'lead_confirmed'
),
(
  'ACT_003', 'PLAN_002', 'REP_031', 'TER_021', 'high', '2026-02-17', 'stock_replenishment',
  'Hold Sikar mustard grower outreach and replenish Score 250 EC before sell-through activation.',
  ARRAY['RTL_0201','RTL_0205'], 'CNT_STOCK_REP', 'stock_cover_restored'
)
ON CONFLICT (action_id) DO UPDATE SET
  summary = EXCLUDED.summary,
  priority = EXCLUDED.priority;
