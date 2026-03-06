"""Create AdminOTP and ActivityLog tables without resetting data."""
import asyncio, sys
sys.path.insert(0, '.')

SQL = """
CREATE TABLE IF NOT EXISTS "AdminOTP" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  wallet TEXT NOT NULL,
  code TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor TEXT NOT NULL,
  "actorRole" TEXT NOT NULL DEFAULT 'user',
  action TEXT NOT NULL,
  "targetId" TEXT,
  "targetType" TEXT,
  metadata JSONB,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""

async def main():
    from prisma import Prisma
    db = Prisma()
    await db.connect()
    await db.execute_raw("""
CREATE TABLE IF NOT EXISTS "AdminOTP" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  wallet TEXT NOT NULL,
  code TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
)
""")
    await db.execute_raw("""
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor TEXT NOT NULL,
  "actorRole" TEXT NOT NULL DEFAULT 'user',
  action TEXT NOT NULL,
  "targetId" TEXT,
  "targetType" TEXT,
  metadata JSONB,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
)
""")
    print("Tables created (or already exist): AdminOTP, ActivityLog")
    await db.disconnect()

asyncio.run(main())
