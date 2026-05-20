from functools import lru_cache

from app.config import settings
from app.repositories.base import CampaignRepository
from app.repositories.demo import DemoRepository
from app.repositories.local_csv import LocalCsvRepository
from app.repositories.supabase import SupabaseCampaignRepository


@lru_cache(maxsize=1)
def get_repository() -> CampaignRepository:
    demo_repository = DemoRepository()
    if settings.data_mode == "supabase" and settings.supabase_enabled:
        return SupabaseCampaignRepository(settings, demo_repository)
    if settings.data_mode in ("local", "hybrid", "ml"):
        return LocalCsvRepository()
    return demo_repository
