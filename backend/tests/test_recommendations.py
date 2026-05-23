from .conftest import auth_headers


def test_recommendations(client, user_credentials):
    headers = auth_headers(client, user_credentials)

    story_a = client.post(
        "/api/stories",
        json={
            "title": "Rec A",
            "description": "A",
            "genre": "Fantasy",
            "tags": ["magic", "dragon"],
            "status": "published",
        },
        headers=headers,
    ).json()

    story_b = client.post(
        "/api/stories",
        json={
            "title": "Rec B",
            "description": "B",
            "genre": "Fantasy",
            "tags": ["magic", "quest"],
            "status": "published",
        },
        headers=headers,
    ).json()

    recs = client.get(f"/api/stories/{story_a['_id']}/recommendations?limit=5")
    assert recs.status_code == 200
    assert "recommendations" in recs.json()

    client.delete(f"/api/stories/{story_a['_id']}", headers=headers)
    client.delete(f"/api/stories/{story_b['_id']}", headers=headers)
