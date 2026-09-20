from .conftest import auth_headers
import uuid


def _creds(tag):
    uid = uuid.uuid4().hex[:8]
    return {
        "email": f"{tag}_{uid}@example.com",
        "username": f"{tag}_{uid}",
        "password": "secret123",
    }


def test_recipient_can_read_decrypted_message(client):
    sender_creds = _creds("sender")
    recipient_creds = _creds("recipient")

    sender_headers = auth_headers(client, sender_creds)
    recipient_headers = auth_headers(client, recipient_creds)

    recipient_me = client.get("/api/auth/me", headers=recipient_headers).json()
    sender_me = client.get("/api/auth/me", headers=sender_headers).json()

    send_res = client.post(
        "/api/messages",
        json={"recipient_id": recipient_me["_id"], "content": "Hello there!"},
        headers=sender_headers,
    )
    assert send_res.status_code == 201

    thread = client.get(f"/api/messages/with/{recipient_me['_id']}", headers=sender_headers)
    assert thread.status_code == 200
    assert thread.json()[0]["content"] == "Hello there!", thread.json()

    recv_thread = client.get(f"/api/messages/with/{sender_me['_id']}", headers=recipient_headers)
    assert recv_thread.status_code == 200
    assert recv_thread.json()[0]["content"] == "Hello there!", recv_thread.json()

    convos = client.get("/api/messages/conversations", headers=recipient_headers)
    assert convos.status_code == 200
    assert any(c["last_message"] == "Hello there!" for c in convos.json()), convos.json()