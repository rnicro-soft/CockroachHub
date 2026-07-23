from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://helpline:helpline_secret@localhost:5444/helpline"
    secret_key: str = ""  # REQUIRED — set via SECRET_KEY env var. Generate: openssl rand -hex 32
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 120
    admin_email: str = "admin@helpline.local"
    admin_password: str = ""  # REQUIRED — set via ADMIN_PASSWORD env var
    admin_name: str = "Super Admin"
    vapid_private_key: str = ""  # Optional — auto-generated if not set

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
