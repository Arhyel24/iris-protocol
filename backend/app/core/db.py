import os
from pathlib import Path
from dotenv import load_dotenv
from prisma import Prisma

# Load .env from the backend root so the Prisma Rust engine
# can read DATABASE_URL as an actual OS environment variable
_env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=_env_path, override=False)

db = Prisma()
