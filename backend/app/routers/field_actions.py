from fastapi import APIRouter

from app.models.contracts import FieldActionsResponse
from app.repositories import get_repository

router = APIRouter()


@router.get("/field-actions", response_model=FieldActionsResponse)
def get_field_actions(plan_id: str = "PLAN_001"):
    return get_repository().get_field_actions(plan_id)
