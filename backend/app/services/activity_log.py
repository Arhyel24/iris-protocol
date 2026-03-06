"""
IRIS Protocol — Activity Log Service
======================================
Records all significant protocol actions into the ActivityLog table.
All functions are fire-and-forget: errors are logged but never propagate.
"""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


async def log_activity(
    *,
    db,           # Prisma client
    actor: str,   # wallet address or "system"
    actor_role: str = "user",
    action: str,  # dot-notation: "policy.created", "claim.approved", etc.
    target_id: str | None = None,
    target_type: str | None = None,
    metadata: dict[str, Any] | None = None,
    ip_address: str | None = None,
) -> None:
    """Insert a row into ActivityLog. Never raises."""
    try:
        await db.execute_raw(
            """
            INSERT INTO "ActivityLog"
              (id, actor, "actorRole", action, "targetId", "targetType", metadata, "ipAddress", "createdAt")
            VALUES
              (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6::jsonb, $7, now())
            """,
            actor,
            actor_role,
            action,
            target_id,
            target_type,
            __json(metadata),
            ip_address,
        )
    except Exception as exc:
        logger.error("ActivityLog insert failed (%s / %s): %s", actor, action, exc)


def __json(data: dict | None) -> str | None:
    if not data:
        return None
    import json
    return json.dumps(data, default=str)
