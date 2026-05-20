from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

from app.config import settings
from app.routers import analytics, content, context, export, field_actions, recommendations, scenarios
from app.routers import workflow as workflow_router

app = FastAPI(
    title="Syngenta Krishi Campaign Copilot API",
    version="0.2.0",
    description="Intelligence-layer API for crop-stage-aware campaign orchestration.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import time
from fastapi import Request

@app.middleware("http")
async def add_start_time_to_state(request: Request, call_next):
    request.state.start_time = time.perf_counter()
    response = await call_next(request)
    return response

app.include_router(scenarios.router, prefix="/api/v1", tags=["scenarios"])
app.include_router(context.router, prefix="/api/v1", tags=["campaign-context"])
app.include_router(recommendations.router, prefix="/api/v1", tags=["recommendations"])
app.include_router(content.router, prefix="/api/v1/content", tags=["content"])
app.include_router(field_actions.router, prefix="/api/v1", tags=["field-actions"])
app.include_router(analytics.router, prefix="/api/v1", tags=["analytics"])
app.include_router(export.router, prefix="/api/v1", tags=["export"])
app.include_router(workflow_router.router, prefix="/api/v1", tags=["workflow"])

EXPORT_DIR = Path(__file__).resolve().parents[2] / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/exports", StaticFiles(directory=str(EXPORT_DIR)), name="exports")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "syngenta-copilot-api"}
