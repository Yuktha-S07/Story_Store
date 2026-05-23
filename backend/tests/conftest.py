import os
import uuid
import pytest
from fastapi.testclient import TestClient

# Ensure test database is used before app import
os.environ.setdefault("DATABASE_NAME", "story_store_test")

from app.main import app
from app import database


@pytest.fixture()
def client():
    with TestClient(app) as client:
        yield client
    db = database.get_database()
    if db is not None:
        db.users.delete_many({})
        db.stories.delete_many({})
        db.chapters.delete_many({})
        db.likes.delete_many({})
        db.bookmarks.delete_many({})
        db.reading_history.delete_many({})


@pytest.fixture()
def user_credentials():
    uid = uuid.uuid4().hex[:8]
    return {
        "email": f"user_{uid}@example.com",
        "username": f"user_{uid}",
        "password": "secret123",
    }


def auth_headers(client: TestClient, creds: dict) -> dict:
    res = client.post("/api/auth/register", json=creds)
    if res.status_code not in (200, 201):
        raise RuntimeError(res.text)
    login_res = client.post("/api/auth/login", json={"email": creds["email"], "password": creds["password"]})
    if login_res.status_code != 200:
        raise RuntimeError(login_res.text)
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
