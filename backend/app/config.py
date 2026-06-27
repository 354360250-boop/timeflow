import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./timeflow.db"
    redis_url: str = ""
    secret_key: str = "dev-secret-change-in-production"
    debug: bool = True

    model_config = {"env_file": ".env"}


settings = Settings()

# Allow environment override
if os.getenv("DATABASE_URL"):
    settings.database_url = os.getenv("DATABASE_URL")
if os.getenv("REDIS_URL"):
    settings.redis_url = os.getenv("REDIS_URL")
