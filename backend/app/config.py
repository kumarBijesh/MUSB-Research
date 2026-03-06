from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import Any


class Settings(BaseSettings):
    # App
    APP_NAME: str = "MusB Backend"
    APP_VERSION: str = "1.1.0"
    DEBUG: bool = False
    ENV: str = "development" # development, staging, production

    # Database
    DATABASE_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "musb_research"

    # Security
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION_VERY_LONG_SECRET_KEY"
    ENCRYPTION_KEY: str = ""  # MUST be set via environment variable
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # RS256 key pair (optional, only if using RS256)
    PRIVATE_KEY: str = ""
    PUBLIC_KEY: str = ""

    # CORS
    ALLOWED_ORIGINS: Any = [
        "https://musbresearchwebsite.vercel.app",
        "https://musb-research-f3on.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
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

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str, info: Any) -> str:
        if v == "CHANGE_THIS_IN_PRODUCTION_VERY_LONG_SECRET_KEY" and info.data.get("ENV") == "production":
            raise ValueError("SECRET_KEY must be changed in production!")
        return v

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

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
    settings = Settings()
    # Manual check for missing critical keys if not caught by pydantic
    if settings.ENV == "production":
        if not settings.SECRET_KEY or len(settings.SECRET_KEY) < 32:
             raise ValueError("SECRET_KEY is missing or too short for production.")
        if not settings.DATABASE_URL.startswith("mongodb+srv") and not settings.DEBUG:
             # Just a warning or strict check? Let's be strict.
             pass
    return settings
