"""
Configuration settings for the IRIS AI Risk Engine
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "IRIS AI Risk Engine"
    CORS_ORIGINS: List[str] = ["*"]
    
    # Model paths
    MODEL_PATH: Path = Path("models/risk_model.pkl")
    SCALER_PATH: Path = Path("models/scaler.pkl")
    
    # Data API Keys
    HELIUS_API_KEY: str = os.getenv("HELIUS_API_KEY", "")
    HELIUS_RPC_URL: str = f"https://mainnet.helius-rpc.com/?api-key={HELIUS_API_KEY}"
    COINGECKO_API_KEY: Optional[str] = os.getenv("COINGECKO_API_KEY", "")
    
    # Oracle settings
    PYTH_ENDPOINT: str = "https://hermes.pyth.network/v2"
    SWITCHBOARD_ENDPOINT: str = "https://api.switchboard.xyz/api/v2"
    
    # DEX API endpoints
    RAYDIUM_API: str = "https://api.raydium.io/v2"
    ORCA_API: str = "https://api.orca.so"
    
    # LLM settings
    USE_LLM: bool = True
    LLM_PROVIDER: str = "openai"  # Options: "openai", "llama"
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = "gpt-4-turbo"
    LLAMA_ENDPOINT: Optional[str] = os.getenv("LLAMA_ENDPOINT", "")
    
    # Performance settings
    CACHE_EXPIRY: int = 60  # seconds
    REQUEST_TIMEOUT: int = 30  # seconds
    
    # Thresholds
    HIGH_RISK_THRESHOLD: float = 75.0
    MEDIUM_RISK_THRESHOLD: float = 50.0
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()