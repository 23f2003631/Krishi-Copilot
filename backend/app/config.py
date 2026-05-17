import os
from dataclasses import dataclass, field


@dataclass(frozen=True)
class Settings:
    data_mode: str = os.getenv("DATA_MODE", "mock")
    demo_cache_enabled: bool = os.getenv("DEMO_CACHE_ENABLED", "true").lower() != "false"

    # Supabase
    supabase_url: str | None = os.getenv("SUPABASE_URL") or None
    supabase_service_role_key: str | None = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or None
    supabase_storage_bucket: str = os.getenv("SUPABASE_STORAGE_BUCKET", "exports")

    # LLM Provider (gemini | openai)
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini")
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY") or None
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY") or None
    llm_model: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")

    # CORS
    cors_origins: list[str] = field(default_factory=lambda: [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
        if origin.strip()
    ])

    # DuckDB
    duckdb_data_path: str = os.getenv("DUCKDB_DATA_PATH", "./data/csv")

    @property
    def supabase_enabled(self) -> bool:
        return self.data_mode in ("supabase", "hybrid") and bool(self.supabase_url and self.supabase_service_role_key)

    @property
    def llm_enabled(self) -> bool:
        if self.llm_provider == "gemini":
            return bool(self.gemini_api_key)
        if self.llm_provider == "openai":
            return bool(self.openai_api_key)
        return False


settings = Settings()

import logging
logger = logging.getLogger(__name__)
logger.info("Configuration loaded. DATA_MODE: %s, DEMO_CACHE_ENABLED: %s", settings.data_mode, settings.demo_cache_enabled)
if settings.llm_enabled:
    logger.info("Provider selected: %s (Model: %s)", settings.llm_provider, settings.gemini_model if settings.llm_provider == "gemini" else settings.llm_model)
else:
    logger.warning("No LLM provider active. Content generation will fall back to demo templates.")
