"""Simulate exactly what admin_otp_request does."""
import asyncio, sys, random, string, logging
from datetime import datetime, timedelta, timezone

logging.basicConfig(level=logging.DEBUG)
sys.path.insert(0, '.')

WALLET = "5F7UbQsPcJ7oMSygH9eoPhCgBxAmnZVkKuYaWt3i1K4s"

async def test():
    from prisma import Prisma
    db = Prisma()
    await db.connect()

    # 1. Look up user
    user = await db.user.find_unique(where={"wallet": WALLET})
    print(f"User found: {user is not None}, role: {getattr(user, 'role', None)}, email: {getattr(user, 'email', None)}")

    # 2. Generate OTP
    code = "".join(random.choices(string.digits, k=6))
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    print(f"Code: {code}, expires: {expires}")

    # 3. Invalidate old OTPs
    try:
        await db.execute_raw(
            'UPDATE "AdminOTP" SET used = true WHERE wallet = $1 AND used = false',
            WALLET,
        )
        print("Step 3 (invalidate old): OK")
    except Exception as e:
        print(f"Step 3 ERROR: {type(e).__name__}: {e}")

    # 4. Insert new OTP
    try:
        await db.execute_raw(
            'INSERT INTO "AdminOTP" (id, email, wallet, code, used, "expiresAt") '
            'VALUES (gen_random_uuid()::text, $1, $2, $3, false, $4::TIMESTAMP)',
            user.email, WALLET, code, expires.replace(tzinfo=None).isoformat(),
        )
        print("Step 4 (insert OTP): OK")
    except Exception as e:
        print(f"Step 4 ERROR: {type(e).__name__}: {e}")
        import traceback; traceback.print_exc()

    # 5. Send email (don't actually send, just initialize service)
    try:
        from app.services import email_service as mail
        print("Email service imported OK")
        # Uncomment to actually test sending:
        # await mail.send_admin_otp(user.email, code, WALLET)
        # print("Email sent OK")
    except Exception as e:
        print(f"Step 5 (email) ERROR: {type(e).__name__}: {e}")
        import traceback; traceback.print_exc()

    await db.disconnect()

asyncio.run(test())
