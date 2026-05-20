"""Workflow router — runtime orchestration endpoints.

POST /workflow/start              → Bootstrap full entity chain
GET  /workflow/{workflow_id}      → Get workflow state
GET  /workflow/{workflow_id}/events → Get timeline events
GET  /workflow/{workflow_id}/kpis  → Get dynamic KPIs
GET  /operational-events           → Get polling-based operational intelligence
GET  /system/health                → System health snapshot
"""

from fastapi import APIRouter, HTTPException, Query, Request
import time

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
def create_workflow(request: Request, body: WorkflowStartRequest):
    """Bootstrap a complete workflow entity chain with runtime UUIDs."""
    res = start_workflow(body)
    start_time = getattr(request.state, "start_time", None)
    if start_time:
        res["response_time_ms"] = int((time.perf_counter() - start_time) * 1000)
    return res


@router.get("/workflow/{workflow_id}")
def read_workflow(request: Request, workflow_id: str):
    """Get the complete state of a workflow."""
    state = get_workflow_state(workflow_id)
    if not state:
        raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
    
    # Return a copy with dynamic request timing
    state_dict = dict(state)
    start_time = getattr(request.state, "start_time", None)
    if start_time:
        state_dict["response_time_ms"] = int((time.perf_counter() - start_time) * 1000)
    return state_dict


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
