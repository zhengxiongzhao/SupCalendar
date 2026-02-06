from dotenv import load_dotenv
from functools import lru_cache
from typing import List
import os

load_dotenv()


class Settings:
    database_type: str = os.getenv("DATABASE_TYPE", "sqlite")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./sqlite_data/supcal.db")
    secret_key: str = os.getenv("SECRET_KEY", "change-me-in-production")
    allowed_origins: List[str] = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000"
    ).split(",")

    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")
    google_client_secret: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    google_redirect_uri: str = os.getenv(
        "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/calendar/callback/google"
    )

    subscription_token_expiry_hours: int = int(
        os.getenv("SUBSCRIPTION_TOKEN_EXPIRY_HOURS", "720")
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
