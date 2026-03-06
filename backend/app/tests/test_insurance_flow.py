"""
Integration tests for the full IRIS insurance flow:
  create user → request quote → create policy → file claim → review claim
"""

import pytest
from httpx import AsyncClient

WALLET = "BoUpQJsGS3fR9vJPZBXZtVs4KaPBmAQRnDXvpPz1234"


@pytest.mark.anyio
async def test_create_user(client: AsyncClient):
    response = await client.post("/api/v1/users/", json={"wallet": WALLET})
    assert response.status_code == 201
    data = response.json()
    assert data["wallet"] == WALLET
    assert data["role"] == "user"


@pytest.mark.anyio
async def test_full_insurance_flow(client: AsyncClient):
    # 1. Create user
    r = await client.post("/api/v1/users/", json={"wallet": WALLET + "flow"})
    assert r.status_code == 201
    user_id = r.json()["id"]

    # 2. Request quote
    r = await client.post(
        "/api/v1/quotes/",
        json={
            "userId": user_id,
            "productType": "flight",
            "coverageAmount": 1000.0,
        },
    )
    assert r.status_code == 201
    quote = r.json()
    assert quote["premiumAmount"] > 0
    quote_id = quote["id"]

    # 3. Activate policy (mock tx hashes)
    r = await client.post(
        "/api/v1/policies/",
        json={
            "quoteId": quote_id,
            "premiumTxHash": "abc123" * 10,
            "escrowAccount": "ESC" + "x" * 20,
        },
    )
    assert r.status_code == 201
    policy = r.json()
    assert policy["status"] == "active"
    policy_id = policy["id"]

    # 4. File a claim
    r = await client.post(
        "/api/v1/claims/",
        json={
            "policyId": policy_id,
            "description": "Flight cancelled due to weather.",
            "incidentDate": "2025-06-01T10:00:00Z",
        },
    )
    assert r.status_code == 201
    claim = r.json()
    assert claim["status"] == "pending"
    claim_id = claim["id"]

    # 5. Approve the claim
    r = await client.patch(
        f"/api/v1/claims/{claim_id}/review",
        json={"decision": "approved", "payoutAmount": 900.0},
    )
    assert r.status_code == 200
    reviewed = r.json()
    assert reviewed["status"] == "paid"
    assert reviewed["payoutTxHash"] is not None
