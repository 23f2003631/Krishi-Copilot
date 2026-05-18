from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

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

app.include_router(scenarios.router, prefix="/api/v1", tags=["scenarios"])
app.include_router(context.router, prefix="/api/v1", tags=["campaign-context"])
app.include_router(recommendations.router, prefix="/api/v1", tags=["recommendations"])
app.include_router(content.router, prefix="/api/v1/content", tags=["content"])
app.include_router(field_actions.router, prefix="/api/v1", tags=["field-actions"])
app.include_router(analytics.router, prefix="/api/v1", tags=["analytics"])
app.include_router(export.router, prefix="/api/v1", tags=["export"])
app.include_router(workflow_router.router, prefix="/api/v1", tags=["workflow"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "syngenta-copilot-api"}

