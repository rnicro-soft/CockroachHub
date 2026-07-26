from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = ""  # REQUIRED — set via DATABASE_URL env var
    secret_key: str = ""  # REQUIRED — set via SECRET_KEY env var. Generate: openssl rand -hex 32
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 120  # 2 hours
    admin_email: str = "admin@helpline.local"  # used for seeding; set via ADMIN_EMAIL env var
    admin_password: str = ""  # REQUIRED — set via ADMIN_PASSWORD env var
    admin_name: str = "Super Admin"
    vapid_private_key: str = ""  # Optional — auto-generated if not set

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
