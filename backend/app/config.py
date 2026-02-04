from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    database_type: str = "sqlite"
    database_url: str = "sqlite:///./sqlite_data/supcal.db"
    secret_key: str = "change-me-in-production"
    allowed_origins: List[str] = ["http://localhost:3000"]

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/calendar/callback/google"

    subscription_token_expiry_hours: int = 24 * 30  # 30 days

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
