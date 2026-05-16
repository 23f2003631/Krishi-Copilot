from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analytics, content, context, export, field_actions, recommendations, scenarios

app = FastAPI(
    title="Syngenta Krishi Campaign Copilot API",
    version="0.1.0",
    description="Mock-first API contracts for crop-stage-aware campaign orchestration.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "syngenta-copilot-api"}

