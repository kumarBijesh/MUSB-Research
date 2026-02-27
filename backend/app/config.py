from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import Any


class Settings(BaseSettings):
    # App
    APP_NAME: str = "MusB Backend"
    APP_VERSION: str = "1.1.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "musb_research"

    # Security
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION_VERY_LONG_SECRET_KEY"
    ENCRYPTION_KEY: str = "thR8M8l1QfjLd9OYFPzRI_ioWtkaBkDPCmpcRsAAEAM="
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    ALLOWED_ORIGINS: Any = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> Any:
        if isinstance(v, str):
            if not v.strip():
                return []
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Email (optional, for notifications)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_EMAIL: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@musbresearch.com"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
