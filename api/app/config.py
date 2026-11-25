from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    database_url: str
    jwt_secret_key: str = Field(min_length=32)
    jwt_issuer: str = "pharmacy-manager-api"
    jwt_audience: str = "pharmacy-manager-client"
    access_token_minutes: int = Field(default=15, ge=5, le=60)
    cors_origins: str = "http://localhost:3000"

    @property
    def allowed_origins(self) -> list[str]:
        return [value.strip() for value in self.cors_origins.split(",") if value.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
