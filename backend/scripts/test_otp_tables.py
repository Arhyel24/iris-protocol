import asyncio, sys
sys.path.insert(0, '.')

async def test():
    from prisma import Prisma
    db = Prisma()
    await db.connect()

    for table in ["AdminOTP", "ActivityLog"]:
        try:
            r = await db.query_raw(f'SELECT 1 AS ok FROM "{table}" LIMIT 1')
            print(f"[OK]  {table} exists")
        except Exception as e:
            print(f"[ERR] {table}: {type(e).__name__}: {str(e)[:300]}")

    # Check admin user has email
    try:
        user = await db.user.find_first(where={"role": "admin"})
        if user:
            print(f"[OK]  Admin user: {user.wallet[:20]}... email: {user.email}")
        else:
            print("[ERR] No admin user found")
    except Exception as e:
        print(f"[ERR] User query: {e}")

    # Check solana_client imports
    try:
        from app.core.solana_client import get_oracle_sol_balance, get_usdc_ata_balance
        print("[OK]  solana_client extra functions import OK")
    except Exception as e:
        print(f"[ERR] solana_client: {e}")

    # Check security module
    try:
        from app.core.security import verify_wallet_signature
        print("[OK]  verify_wallet_signature import OK")
    except Exception as e:
        print(f"[ERR] security: {e}")

    await db.disconnect()

asyncio.run(test())
