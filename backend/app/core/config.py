from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "BiteNow API"
    
    # Database
    DATABASE_URL: str
    
    # Clerk
    CLERK_SECRET_KEY: str
    CLERK_WEBHOOK_SECRET: Optional[str] = None
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
