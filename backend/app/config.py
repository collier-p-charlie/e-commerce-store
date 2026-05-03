from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    database_url: str = "sqlite:///./shop.db"  # only a fallback if not present in ENV_VARS or .env
    # dialect+driver://username:password@host:port/database_name
    # sqlite:/// = relative, sqlite://// = absolute

    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440


settings = Settings()
