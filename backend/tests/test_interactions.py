from .conftest import auth_headers
import uuid


def test_like_bookmark_history(client, user_credentials):
    headers = auth_headers(client, user_credentials)

    story_res = client.post(
        "/api/stories",
        json={
            "title": "Interaction Story",
            "description": "desc",
            "genre": "Drama",
            "tags": ["tag"],
            "status": "published",
        },
        headers=headers,
    )
    story_id = story_res.json().get("_id")

    chapter_res = client.post(
        f"/api/stories/{story_id}/chapters",
        json={"title": "Chapter", "content": "Content", "status": "published"},
        headers=headers,
    )
    chapter_id = chapter_res.json().get("_id")

    like_res = client.post(f"/api/stories/{story_id}/like", headers=headers)
    assert like_res.status_code == 200

    likes = client.get("/api/likes", headers=headers)
    assert likes.status_code == 200

    bookmark_res = client.post(
        f"/api/stories/{story_id}/chapters/{chapter_id}/bookmark",
        headers=headers,
    )
    assert bookmark_res.status_code == 200

    history_res = client.post(
        f"/api/stories/{story_id}/chapters/{chapter_id}/history",
        headers=headers,
    )
    assert history_res.status_code == 200

    unlike_res = client.delete(f"/api/stories/{story_id}/like", headers=headers)
    assert unlike_res.status_code == 200

    client.delete(f"/api/stories/{story_id}", headers=headers)


def test_comment_edit_delete(client, user_credentials):
    headers = auth_headers(client, user_credentials)

    story_res = client.post(
        "/api/stories",
        json={
            "title": "Comment Story",
            "description": "desc",
            "genre": "Drama",
            "tags": ["tag"],
            "status": "published",
        },
        headers=headers,
    )
    story_id = story_res.json().get("_id")

    add_res = client.post(
        f"/api/stories/{story_id}/comments",
        json={"content": "Original comment"},
        headers=headers,
    )
    assert add_res.status_code == 201

    comments = client.get(f"/api/stories/{story_id}/comments")
    assert comments.status_code == 200
    assert len(comments.json()) == 1
    comment_id = comments.json()[0]["_id"]

    update_res = client.put(
        f"/api/stories/{story_id}/comments/{comment_id}",
        json={"content": "Edited comment"},
        headers=headers,
    )
    assert update_res.status_code == 200

    comments = client.get(f"/api/stories/{story_id}/comments")
    assert comments.json()[0]["content"] == "Edited comment"
    assert comments.json()[0].get("updated_at") is not None

    delete_res = client.delete(
        f"/api/stories/{story_id}/comments/{comment_id}",
        headers=headers,
    )
    assert delete_res.status_code == 200

    comments = client.get(f"/api/stories/{story_id}/comments")
    assert len(comments.json()) == 0

    client.delete(f"/api/stories/{story_id}", headers=headers)


def test_cannot_edit_or_delete_others_comment(client, user_credentials):
    headers = auth_headers(client, user_credentials)

    story_res = client.post(
        "/api/stories",
        json={
            "title": "Ownership Story",
            "description": "desc",
            "genre": "Drama",
            "tags": ["tag"],
            "status": "published",
        },
        headers=headers,
    )
    story_id = story_res.json().get("_id")

    client.post(
        f"/api/stories/{story_id}/comments",
        json={"content": "First comment"},
        headers=headers,
    )
    comment_id = client.get(f"/api/stories/{story_id}/comments").json()[0]["_id"]

    other_headers = auth_headers(
        client,
        {
            "email": f"other_{uuid.uuid4().hex[:8]}@example.com",
            "username": f"other_{uuid.uuid4().hex[:8]}",
            "password": "secret123",
        },
    )

    update_other = client.put(
        f"/api/stories/{story_id}/comments/{comment_id}",
        json={"content": "Hacked"},
        headers=other_headers,
    )
    assert update_other.status_code == 404

    delete_other = client.delete(
        f"/api/stories/{story_id}/comments/{comment_id}",
        headers=other_headers,
    )
    assert delete_other.status_code == 404

    assert client.get(f"/api/stories/{story_id}/comments").json()[0]["content"] == "First comment"

    client.delete(f"/api/stories/{story_id}", headers=headers)
