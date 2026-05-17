from functools import lru_cache

from app.config import settings
from app.repositories.base import CampaignRepository
from app.repositories.demo import DemoRepository
from app.repositories.supabase import SupabaseCampaignRepository


@lru_cache(maxsize=1)
def get_repository() -> CampaignRepository:
    demo_repository = DemoRepository()
    if settings.supabase_enabled:
        return SupabaseCampaignRepository(settings, demo_repository)
    return demo_repository
