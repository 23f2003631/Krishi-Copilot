"""Workflow router — runtime orchestration endpoints.

POST /workflow/start              → Bootstrap full entity chain
GET  /workflow/{workflow_id}      → Get workflow state
GET  /workflow/{workflow_id}/events → Get timeline events
GET  /workflow/{workflow_id}/kpis  → Get dynamic KPIs
GET  /operational-events           → Get polling-based operational intelligence
GET  /system/health                → System health snapshot
"""

from fastapi import APIRouter, HTTPException, Query

from app.models.contracts import WorkflowStartRequest
from app.services.workflow import (
    get_operational_events,
    get_system_health,
    get_workflow_events,
    get_workflow_kpis,
    get_workflow_state,
    start_workflow,
)

router = APIRouter()


@router.post("/workflow/start")
def create_workflow(request: WorkflowStartRequest):
    """Bootstrap a complete workflow entity chain with runtime UUIDs."""
    return start_workflow(request)


@router.get("/workflow/{workflow_id}")
def read_workflow(workflow_id: str):
    """Get the complete state of a workflow."""
    state = get_workflow_state(workflow_id)
    if not state:
        raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
    return state


@router.get("/workflow/{workflow_id}/events")
def read_workflow_events(workflow_id: str):
    """Get timeline events for a workflow."""
    events = get_workflow_events(workflow_id)
    return {"workflow_id": workflow_id, "events": events}


@router.get("/workflow/{workflow_id}/kpis")
def read_workflow_kpis(workflow_id: str, role: str = Query(default="campaign_manager")):
    """Get dynamic KPIs for a workflow + role."""
    return get_workflow_kpis(workflow_id, role)


@router.get("/operational-events")
def read_operational_events(
    role: str = Query(default="campaign_manager"),
    workflow_id: str | None = Query(default=None),
):
    """Get polling-based operational intelligence events."""
    events = get_operational_events(role, workflow_id)
    return {"role": role, "events": events}


@router.get("/system/health")
def read_system_health():
    """Get system health snapshot."""
    return get_system_health()
