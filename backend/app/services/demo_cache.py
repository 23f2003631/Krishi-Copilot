from copy import deepcopy

GENERATED_AT = "2026-05-17T10:00:00+05:30"

SCENARIOS = [
    {
        "scenario_id": "WHEAT_UP_FLOWERING_RISK",
        "name": "Wheat disease-risk campaign",
        "crop": "wheat",
        "geography": {
            "state": "Uttar Pradesh",
            "district": "Kanpur Nagar",
            "tehsil": "Kanpur_Nagar_T023",
            "territory_id": "TER_001",
        },
        "description": "Flowering-stage wheat growers, rising humidity and rainfall risk, healthy Tilt 250 EC stock.",
        "risk_level": "high",
        "stock_status": "healthy",
    },
    {
        "scenario_id": "MUSTARD_RJ_LOW_STOCK",
        "name": "Mustard campaign blocked by stock",
        "crop": "mustard",
        "geography": {
            "state": "Rajasthan",
            "district": "Sikar",
            "tehsil": "Sikar_T011",
            "territory_id": "TER_021",
        },
        "description": "Campaign should pause because local Score 250 EC stock cover is below the launch threshold.",
        "risk_level": "medium",
        "stock_status": "low",
    },
]

CAMPAIGN_CONTEXT = {
    "schema_version": "syngenta-copilot.v1",
    "request_id": "REQ_001",
    "context_id": "CTX_001",
    "generated_at": GENERATED_AT,
    "source_mode": "hybrid",
    "crop_stage": {"stage": "flowering", "days_to_stage": 3, "confidence": 0.82},
    "grower_summary": {
        "estimated_growers": 1180,
        "smartphone_share": 0.74,
        "keypad_share": 0.18,
        "primary_language": "Hindi",
    },
    "weather_insights": [
        {
            "risk_type": "humidity_rainfall",
            "risk_level": "high",
            "summary": "Humidity and light rainfall raise disease-risk messaging priority.",
            "confidence": 0.76,
        }
    ],
    "inventory_alerts": [
        {
            "product": "Tilt 250 EC",
            "stock_status": "healthy",
            "stock_cover_days": 18,
            "affected_retailers": 6,
        }
    ],
    "warnings": [],
}

RECOMMENDATIONS = {
    "schema_version": "syngenta-copilot.v1",
    "request_id": "REQ_002",
    "plan_id": "PLAN_001",
    "context_id": "CTX_001",
    "generated_at": "2026-05-17T10:01:00+05:30",
    "source_mode": "rules",
    "recommendations": [
        {
            "recommendation_id": "REC_001",
            "priority_score": 91,
            "segment_label": "Hindi smartphone wheat growers near flowering",
            "target_count": 860,
            "crop": "wheat",
            "product": "Tilt 250 EC",
            "channel_strategy": [
                {"channel": "whatsapp", "rank": 1, "reason": "High smartphone share"},
                {"channel": "field_rep", "rank": 2, "reason": "Trust-sensitive disease advisory"},
                {"channel": "sms", "rank": 3, "reason": "Backup for low bandwidth"},
            ],
            "timing": {"recommended_send_date": "2026-02-18", "send_window": "07:00-10:00", "urgency": "high"},
            "receptivity": {"open_probability": 0.31, "click_probability": 0.08, "confidence": 0.71},
            "expected_impact": {"baseline_click_rate": 0.05, "expected_click_rate": 0.08, "expected_leads": 69},
            "reason_codes": [
                "Crop near flowering",
                "Weather risk elevated",
                "Stock cover above threshold",
                "Hindi is primary language",
            ],
            "human_review_flags": ["agronomy_review_required"],
            "blocked": False,
        }
    ],
    "warnings": [],
}

CONTENT = {
    "schema_version": "syngenta-copilot.v1",
    "request_id": "REQ_003",
    "content_batch_id": "CNT_001",
    "generated_at": "2026-05-17T10:02:00+05:30",
    "source_mode": "hybrid",
    "variants": [
        {
            "content_id": "CNT_001_HI_WA",
            "format": "whatsapp",
            "language": "Hindi",
            "text": "गेहूं की फसल फूल आने की अवस्था के पास है। नमी और हल्की बारिश के कारण रोग का जोखिम बढ़ सकता है। अपने नजदीकी Syngenta प्रतिनिधि या retailer से Tilt 250 EC की उपलब्धता और सही सलाह लें।",
            "cta": "आज ही स्थानीय प्रतिनिधि से संपर्क करें",
            "estimated_read_time_sec": 18,
            "approval_state": "pending_review",
            "safety_flags": [],
        },
        {
            "content_id": "CNT_001_HI_SMS",
            "format": "sms",
            "language": "Hindi",
            "text": "गेहूं में नमी से रोग जोखिम बढ़ सकता है। Tilt 250 EC की उपलब्धता और सही सलाह के लिए Syngenta प्रतिनिधि से संपर्क करें।",
            "cta": "प्रतिनिधि से संपर्क करें",
            "estimated_read_time_sec": 12,
            "approval_state": "pending_review",
            "safety_flags": [],
        },
    ],
    "warnings": [],
}

FIELD_ACTIONS = {
    "schema_version": "syngenta-copilot.v1",
    "request_id": "REQ_004",
    "generated_at": "2026-05-17T10:03:00+05:30",
    "source_mode": "rules",
    "plan_id": "PLAN_001",
    "actions": [
        {
            "action_id": "ACT_001",
            "rep_id": "REP_014",
            "territory_id": "TER_001",
            "priority": "high",
            "due_date": "2026-02-18",
            "action_type": "retailer_and_grower_followup",
            "summary": "Confirm Tilt 250 EC availability with top retailers, then follow up with high-receptivity growers.",
            "retailer_ids": ["RTL_0091", "RTL_0112"],
            "recommended_script_id": "CNT_001_HI_REP",
            "success_metric": "lead_confirmed",
        }
    ],
    "warnings": [],
}

ANALYTICS = {
    "schema_version": "syngenta-copilot.v1",
    "request_id": "REQ_005",
    "generated_at": "2026-05-17T10:04:00+05:30",
    "source_mode": "mock",
    "plan_id": "PLAN_001",
    "kpis": {
        "target_growers": 860,
        "predicted_open_rate": 0.31,
        "predicted_click_rate": 0.08,
        "expected_leads": 69,
        "stock_ready_retailers": 6,
        "field_actions": 4,
    },
    "charts": {
        "channel_mix": [
            {"channel": "whatsapp", "share": 0.7},
            {"channel": "sms", "share": 0.2},
            {"channel": "field_rep", "share": 0.1},
        ],
        "weekly_funnel": [
            {"week": "2026-02-16", "baseline": 43, "recommended": 69},
            {"week": "2026-02-23", "baseline": 47, "recommended": 72},
        ],
    },
    "warnings": [],
}


def clone(data):
    return deepcopy(data)

