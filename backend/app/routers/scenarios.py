from fastapi import APIRouter

from app.models.contracts import ScenarioResponse
from app.repositories import get_repository

router = APIRouter()


@router.get("/scenarios", response_model=ScenarioResponse)
def get_scenarios():
    return get_repository().get_scenarios()
