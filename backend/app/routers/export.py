from fastapi import APIRouter

router = APIRouter()


@router.post("/export")
def export_plan():
    return {
        "schema_version": "syngenta-copilot.v1",
        "request_id": "REQ_EXPORT",
        "generated_at": "2026-05-17T10:06:00+05:30",
        "source_mode": "mock",
        "export_id": "EXP_001",
        "formats": ["csv", "rep_brief", "whatsapp_pack"],
        "download_url": "/demo/export/PLAN_001.zip",
        "warnings": [],
    }

