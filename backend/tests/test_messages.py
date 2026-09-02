from .conftest import auth_headers
import uuid


def _creds(tag):
    uid = uuid.uuid4().hex[:8]
    return {
        "email": f"{tag}_{uid}@example.com",
        "username": f"{tag}_{uid}",
        "password": "secret123",
    }


def test_send_and_read_messages(client):
    sender_creds = _creds("sender")
    recipient_creds = _creds("recipient")

    sender_headers = auth_headers(client, sender_creds)

    register_res = client.post("/api/auth/register", json=recipient_creds)
    assert register_res.status_code in (200, 201)
    recipient_id = register_res.json()["user"]["_id"]

    send_res = client.post(
        "/api/messages",
        json={"recipient_id": recipient_id, "content": "Hello there!"},
        headers=sender_headers,
    )
    assert send_res.status_code == 201

    thread = client.get(f"/api/messages/with/{recipient_id}", headers=sender_headers)
    assert thread.status_code == 200
    assert len(thread.json()) == 1
    assert thread.json()[0]["content"] == "Hello there!"
    assert thread.json()[0]["is_mine"] is True

    convos = client.get("/api/messages/conversations", headers=sender_headers)
    assert convos.status_code == 200
    assert any(c["user_id"] == recipient_id for c in convos.json())


def test_message_requires_recipient_and_content(client, user_credentials):
    headers = auth_headers(client, user_credentials)

    missing_recipient = client.post("/api/messages", json={"content": "hi"}, headers=headers)
    assert missing_recipient.status_code == 400

    empty_content = client.post(
        "/api/messages",
        json={"recipient_id": "60d5ec49e7ef8f0015d5f8b2", "content": "   "},
        headers=headers,
    )
    assert empty_content.status_code == 400
