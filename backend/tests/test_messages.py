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


def _login_headers(client, creds):
    res = client.post("/api/auth/login", json={"email": creds["email"], "password": creds["password"]})
    assert res.status_code == 200
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def test_edit_message(client):
    sender_creds = _creds("editor")
    recipient_creds = _creds("edit_target")

    sender_headers = auth_headers(client, sender_creds)
    recipient_id = client.post("/api/auth/register", json=recipient_creds).json()["user"]["_id"]
    recipient_headers = _login_headers(client, recipient_creds)

    send_res = client.post(
        "/api/messages",
        json={"recipient_id": recipient_id, "content": "before edit"},
        headers=sender_headers,
    )
    assert send_res.status_code == 201
    message_id = client.get(f"/api/messages/with/{recipient_id}", headers=sender_headers).json()[0]["_id"]

    empty_content = client.put(f"/api/messages/{message_id}", json={"content": "   "}, headers=sender_headers)
    assert empty_content.status_code == 400

    edit_res = client.put(f"/api/messages/{message_id}", json={"content": "after edit"}, headers=sender_headers)
    assert edit_res.status_code == 200

    thread = client.get(f"/api/messages/with/{recipient_id}", headers=sender_headers).json()
    assert thread[0]["content"] == "after edit"
    assert thread[0]["updated_at"] is not None

    not_owner = client.put(f"/api/messages/{message_id}", json={"content": "hacked"}, headers=recipient_headers)
    assert not_owner.status_code == 404

    missing = client.put(
        "/api/messages/60d5ec49e7ef8f0015d5f8b2",
        json={"content": "nope"},
        headers=sender_headers,
    )
    assert missing.status_code == 404


def test_message_reactions(client):
    sender_creds = _creds("react_sender")
    recipient_creds = _creds("react_recipient")
    third_creds = _creds("react_third")

    sender_headers = auth_headers(client, sender_creds)
    recipient_id = client.post("/api/auth/register", json=recipient_creds).json()["user"]["_id"]

    client.post(
        "/api/messages",
        json={"recipient_id": recipient_id, "content": "react to me"},
        headers=sender_headers,
    )
    message_id = client.get(f"/api/messages/with/{recipient_id}", headers=sender_headers).json()[0]["_id"]

    add_res = client.post(
        f"/api/messages/{message_id}/reactions",
        json={"emoji": "👍"},
        headers=sender_headers,
    )
    assert add_res.status_code == 200
    assert add_res.json()["action"] == "added"
    assert any(r["emoji"] == "👍" for r in add_res.json()["reactions"])

    thread = client.get(f"/api/messages/with/{recipient_id}", headers=sender_headers).json()
    assert len(thread[0]["reactions"]) == 1
    assert thread[0]["reactions"][0]["emoji"] == "👍"
    assert thread[0]["reactions"][0]["user_id"]

    remove_res = client.post(
        f"/api/messages/{message_id}/reactions",
        json={"emoji": "👍"},
        headers=sender_headers,
    )
    assert remove_res.status_code == 200
    assert remove_res.json()["action"] == "removed"
    assert remove_res.json()["reactions"] == []

    empty_emoji = client.post(
        f"/api/messages/{message_id}/reactions",
        json={"emoji": "  "},
        headers=sender_headers,
    )
    assert empty_emoji.status_code == 400

    third_headers = auth_headers(client, third_creds)
    not_participant = client.post(
        f"/api/messages/{message_id}/reactions",
        json={"emoji": "🔥"},
        headers=third_headers,
    )
    assert not_participant.status_code == 404
