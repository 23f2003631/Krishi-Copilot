from fastapi import APIRouter

from app.models.contracts import Scenario
from app.services.demo_cache import SCENARIOS

router = APIRouter()


@router.get("/scenarios", response_model=list[Scenario])
def get_scenarios():
    return SCENARIOS

