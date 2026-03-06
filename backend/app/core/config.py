"""
IRIS Protocol — application settings.
Reads from the .env file in the backend/ directory.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",  # silently ignore any extra vars in .env
    )

    # ── General ────────────────────────────────────────────────────────────────
    PROJECT_NAME: str = "IRIS Insurance Bridge"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "change-me"

    # ── JWT ────────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-me-jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Database (also consumed directly by the Prisma Rust engine) ────────────
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/iris_db"

    # ── Solana / Helius ────────────────────────────────────────────────────────
    HELIUS_API_KEY: str = ""
    HELIUS_CLUSTER: str = "devnet"  # mainnet-beta | devnet | testnet

    @property
    def HELIUS_RPC_URL(self) -> str:
        return f"https://{self.HELIUS_CLUSTER}.helius-rpc.com/?api-key={self.HELIUS_API_KEY}"

    # ── Insurance provider ────────────────────────────────────────────────────
    INSURANCE_API_URL: str = ""
    INSURANCE_API_KEY: str = ""

    # ── Oracle / Solana on-chain ──────────────────────────────────────────────
    # Base58-encoded private key for the oracle wallet (treasury admin).
    # Generate:  solana-keygen new --outfile oracle.json
    # Export:    python -c "import base58,json; k=json.load(open('oracle.json')); print(base58.b58encode(bytes(k)).decode())"
    ORACLE_PRIVATE_KEY_B58: str = ""
    IRIS_PROGRAM_ID: str = "ECDThuwStZ4a1ksQE2C9wakVoa4RYtBp5e7YAXsTJCHN"
    USDC_MINT: str = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"  # devnet USDC; use EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v for mainnet

    # Treasury on-chain addresses (set after initialize_treasury is run)
    ORACLE_PUBKEY: str = "4o38Z4NfYpuwRMRVyTRhcKuw71FcgaqEnMBCAridYqmx"
    TREASURY_PDA: str = "Dp6MNoxLKGgmCVvEMJ77EadGJb33b1dZVsMZWE56UCaZ"
    TREASURY_USDC_ATA: str = "8hughUCV1PRRm9MCdxYfwXRa6WzvDWX7SRS5KgLN9M8a"

    # How often the premium scheduler checks for due payments
    PREMIUM_SCHEDULER_ENABLED: bool = True
    PREMIUM_SCHEDULER_INTERVAL_MINUTES: int = 60

    # ── Email (SMTP) ───────────────────────────────────────────────────────────
    EMAIL_USER: str = ""
    EMAIL_PASSWORD: str = ""
    EMAIL_FROM: str = ""
    EMAIL_SMTP_HOST: str = "smtp.gmail.com"
    EMAIL_SMTP_PORT: int = 587

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["*"]


settings = Settings()
