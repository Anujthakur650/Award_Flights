"""
Application configuration settings
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AeroPoints"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production", env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:3001",
            "https://aeropoints.com",
        ],
        env="ALLOWED_ORIGINS"
    )
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql://user:password@localhost/aeropoints",
        env="DATABASE_URL"
    )
    
    # OAuth Providers
    GOOGLE_CLIENT_ID: str = Field(default="", env="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = Field(default="", env="GOOGLE_CLIENT_SECRET")
    APPLE_CLIENT_ID: str = Field(default="", env="APPLE_CLIENT_ID")
    APPLE_CLIENT_SECRET: str = Field(default="", env="APPLE_CLIENT_SECRET")
    
    # External APIs
    SEATS_AERO_API_KEY: str = Field(default="", env="SEATS_AERO_API_KEY")
    SEATS_AERO_BASE_URL: str = "https://api.seats.aero/v1"
    
    # Email
    RESEND_API_KEY: str = Field(default="", env="RESEND_API_KEY")
    EMAIL_FROM: str = Field(default="noreply@aeropoints.com", env="EMAIL_FROM")
    
    # Redis (for caching)
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Clerk Auth (JWT verification)
    CLERK_ISSUER: str = Field(default="", env="CLERK_ISSUER")
    CLERK_AUDIENCE: Optional[str] = Field(default=None, env="CLERK_AUDIENCE")
    # Either provide domain (we derive issuer and JWKS), or provide JWKS directly
    CLERK_DOMAIN: Optional[str] = Field(default=None, env="CLERK_DOMAIN")
    CLERK_JWKS_URL: Optional[str] = Field(default=None, env="CLERK_JWKS_URL")

    class Config:
        env_file = ".env"
        case_sensitive = True
        
settings = Settings()
