from fastapi import APIRouter

from app.models.contracts import ExportRequest, ExportResponse
from app.repositories import get_repository

router = APIRouter()


@router.post("/export", response_model=ExportResponse)
def export_plan(request: ExportRequest):
    return get_repository().create_export(request.plan_id, request.export_type)
