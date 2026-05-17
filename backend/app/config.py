import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    data_mode: str = os.getenv("DATA_MODE", "mock")
    demo_cache_enabled: bool = os.getenv("DEMO_CACHE_ENABLED", "true").lower() != "false"
    supabase_url: str | None = os.getenv("SUPABASE_URL")
    supabase_service_role_key: str | None = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase_storage_bucket: str = os.getenv("SUPABASE_STORAGE_BUCKET", "exports")

    @property
    def supabase_enabled(self) -> bool:
        return self.data_mode == "supabase" and bool(self.supabase_url and self.supabase_service_role_key)


settings = Settings()
