from .conftest import auth_headers


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
