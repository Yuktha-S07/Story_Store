from bson import ObjectId

from app import database

from .conftest import auth_headers


def test_story_and_chapter_flow(client, user_credentials):
    headers = auth_headers(client, user_credentials)

    story_payload = {
        "title": "Test Story",
        "description": "test",
        "genre": "Fantasy",
        "tags": ["magic"],
        "status": "draft",
    }
    create_res = client.post("/api/stories", json=story_payload, headers=headers)
    assert create_res.status_code == 201
    story_id = create_res.json().get("_id")
    assert story_id

    update_res = client.put(
        f"/api/stories/{story_id}",
        json={"title": "Updated Story"},
        headers=headers,
    )
    assert update_res.status_code == 200

    chapter_res = client.post(
        f"/api/stories/{story_id}/chapters",
        json={"title": "Chapter 1", "content": "Hello", "status": "draft"},
        headers=headers,
    )
    assert chapter_res.status_code == 201
    chapter_id = chapter_res.json().get("_id")
    assert chapter_id

    get_chapter = client.get(f"/api/chapters/{chapter_id}")
    assert get_chapter.status_code == 200

    delete_res = client.delete(f"/api/stories/{story_id}", headers=headers)
    assert delete_res.status_code == 204


def test_draft_story_with_published_chapter_is_visible_to_other_users(client, user_credentials):
    owner_headers = auth_headers(client, user_credentials)

    story_payload = {
        "title": "Mixed Visibility Story",
        "description": "test",
        "genre": "Fantasy",
        "tags": ["magic"],
        "status": "draft",
    }
    create_res = client.post("/api/stories", json=story_payload, headers=owner_headers)
    assert create_res.status_code == 201
    story_id = create_res.json().get("_id")
    assert story_id

    chapter_res = client.post(
        f"/api/stories/{story_id}/chapters",
        json={"title": "Public Chapter", "content": "Hello", "status": "published"},
        headers=owner_headers,
    )
    assert chapter_res.status_code == 201

    other_uid = user_credentials["email"].split("@")[0] + "_other"
    other_creds = {
        "email": f"{other_uid}@example.com",
        "username": other_uid,
        "password": "secret123",
    }
    other_headers = auth_headers(client, other_creds)

    list_res = client.get("/api/stories?status=published&limit=100", headers=other_headers)
    assert list_res.status_code == 200
    assert any(story.get("_id") == story_id for story in list_res.json())

    detail_res = client.get(f"/api/stories/{story_id}", headers=other_headers)
    assert detail_res.status_code == 200
    chapters = detail_res.json().get("chapters", [])
    assert len(chapters) == 1
    assert chapters[0]["status"] == "published"


def test_list_stories_handles_missing_user_id(client):
    db = database.get_database()
    story_id = ObjectId()
    db.stories.insert_one(
        {
            "_id": story_id,
            "user_id": None,
            "title": "Legacy Story",
            "description": "Inserted with a missing owner to mimic old data.",
            "genre": "Fantasy",
            "tags": [],
            "status": "published",
            "cover_image_url": "",
            "chapter_count": 0,
        }
    )

    response = client.get("/api/stories?status=published&limit=100")
    assert response.status_code == 200
    stories = response.json()
    legacy_story = next((story for story in stories if story.get("_id") == str(story_id)), None)
    assert legacy_story is not None
    assert legacy_story["author"]["username"] == "Unknown"
