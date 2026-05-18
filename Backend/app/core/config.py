# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Healthcare Fraud API"
    API_V1_STR: str = "/api/v1"
    
    # Database connection string
    DATABASE_URL: str
    
    # Secret keys for authentication (if M2 adds login later)
    SECRET_KEY: str
    
    class Config:
        env_file = ".env"

# Create a global settings object to be imported anywhere in the app
settings = Settings()