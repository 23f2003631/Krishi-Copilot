from fastapi import APIRouter

from app.models.contracts import FieldActionsResponse
from app.services.demo_cache import FIELD_ACTIONS, clone

router = APIRouter()


@router.get("/field-actions", response_model=FieldActionsResponse)
def get_field_actions(plan_id: str = "PLAN_001"):
    response = clone(FIELD_ACTIONS)
    response["plan_id"] = plan_id
    return response

