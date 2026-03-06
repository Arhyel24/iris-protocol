"""Tests for the waitlist endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_join_waitlist(client: AsyncClient):
    response = await client.post(
        "/api/v1/waitlist/",
        json={"email": "test@example.com"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["status"] == "pending"


@pytest.mark.anyio
async def test_join_waitlist_duplicate(client: AsyncClient):
    await client.post("/api/v1/waitlist/", json={"email": "dup@example.com"})
    response = await client.post("/api/v1/waitlist/", json={"email": "dup@example.com"})
    assert response.status_code == 409


@pytest.mark.anyio
async def test_join_waitlist_invalid_email(client: AsyncClient):
    response = await client.post("/api/v1/waitlist/", json={"email": "not-an-email"})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_list_waitlist(client: AsyncClient):
    response = await client.get("/api/v1/waitlist/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
