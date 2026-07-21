from datetime import datetime

from bson import ObjectId
from pymongo import ReturnDocument

from app.database import get_database


def _to_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception as err:
        raise ValueError("Invalid ObjectId") from err


def _serialize_author(user_id: ObjectId | str | None) -> dict:
    if not user_id:
        return {"_id": "", "username": "Unknown"}

    try:
        user_oid = _to_object_id(str(user_id))
    except ValueError:
        return {"_id": "", "username": "Unknown"}

    db = get_database()
    user = db.users.find_one({"_id": user_oid}, {"username": 1})
    if not user:
        return {"_id": str(user_id), "username": "Unknown"}

    return {"_id": str(user["_id"]), "username": user.get("username", "Unknown")}


def _serialize_story(doc: dict) -> dict:
    user_id = doc.get("user_id")
    return {
        "_id": str(doc["_id"]),
        "user_id": str(user_id) if user_id else "",
        "author": _serialize_author(user_id),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "genre": doc.get("genre", ""),
        "tags": doc.get("tags", []),
        "status": doc.get("status", "draft"),
        "cover_image_url": doc.get("cover_image_url", ""),
        "chapter_count": doc.get("chapter_count", 0),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


def _serialize_chapter(doc: dict) -> dict:
    return {
        "_id": str(doc["_id"]),
        "story_id": str(doc["story_id"]),
        "user_id": str(doc["user_id"]),
        "title": doc.get("title", ""),
        "content": doc.get("content", ""),
        "chapter_number": doc.get("chapter_number", 1),
        "status": doc.get("status", "draft"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


def _published_story_ids_with_chapters() -> list[ObjectId]:
    db = get_database()
    story_ids = db.chapters.distinct("story_id", {"status": "published"})
    return [story_id for story_id in story_ids if isinstance(story_id, ObjectId)]


def _story_is_publicly_visible(story: dict) -> bool:
    if story.get("status") == "published":
        return True

    db = get_database()
    return db.chapters.find_one({"story_id": story["_id"], "status": "published"}) is not None


def create_story(user_id: str, payload: dict, cover_image_url: str = "") -> dict:
    db = get_database()
    story_doc = {
        "user_id": _to_object_id(user_id),
        "title": payload["title"],
        "description": payload.get("description", ""),
        "genre": payload.get("genre", ""),
        "tags": payload.get("tags", []),
        "status": payload.get("status", "draft"),
        "cover_image_url": cover_image_url,
        "chapter_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    inserted = db.stories.insert_one(story_doc)
    story_doc["_id"] = inserted.inserted_id

    if not cover_image_url:
        cover_index = (int(inserted.inserted_id.generation_time.timestamp()) % 25) + 1
        assigned_cover = f"/uploads/cover_{cover_index}.svg"
        db.stories.update_one(
            {"_id": inserted.inserted_id},
            {"$set": {"cover_image_url": assigned_cover}},
        )
        story_doc["cover_image_url"] = assigned_cover

    return _serialize_story(story_doc)


def list_stories(
    user_id: str | None = None,
    mine: bool = False,
    genre: str | None = None,
    tag: str | None = None,
    q: str | None = None,
    status: str | None = None,
    limit: int = 20,
    skip: int = 0,
    author_id: str | None = None,
) -> list[dict]:
    db = get_database()
    query: dict = {}
    published_story_ids = _published_story_ids_with_chapters()

    # Handle status/ownership filtering
    if mine:
        if not user_id:
            return []
        query["user_id"] = _to_object_id(user_id)
    elif author_id:
        query["user_id"] = _to_object_id(author_id)
        if not status:
            query["status"] = "published"
        else:
            query["status"] = status
    elif status:
        if status == "published":
            visibility_filters = [{"status": "published"}]
            if published_story_ids:
                visibility_filters.append({"_id": {"$in": published_story_ids}})
            query["$or"] = visibility_filters
        else:
            query["status"] = status
    else:
        # Show published stories + current user's draft stories
        if user_id:
            visibility_filters = [
                {"status": "published"},
                {"status": "draft", "user_id": _to_object_id(user_id)},
            ]
            if published_story_ids:
                visibility_filters.append({"_id": {"$in": published_story_ids}})
            query["$or"] = visibility_filters
        else:
            visibility_filters = [{"status": "published"}]
            if published_story_ids:
                visibility_filters.append({"_id": {"$in": published_story_ids}})
            query["$or"] = visibility_filters

    # Add genre filter (works with all cases above)
    if genre:
        query["genre"] = genre
    
    # Add tag filter (works with all cases above)
    if tag:
        query["tags"] = tag
    
    # Add search filter - needs special handling if $or exists
    if q:
        search_or = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$elemMatch": {"$regex": q, "$options": "i"}}},
        ]
        if "$or" in query:
            # If we already have $or (from status/ownership), use $and to combine
            existing_or = query.pop("$or")
            query = {
                "$and": [
                    {"$or": existing_or},
                    {"$or": search_or}
                ]
            }
            # Re-add other filters that are now at top level
            if genre:
                query["genre"] = genre
            if tag:
                query["tags"] = tag
        else:
            # No existing $or, just add search $or
            query["$or"] = search_or

    docs = list(db.stories.find(query).sort("created_at", -1).skip(skip).limit(limit))
    return [_serialize_story(d) for d in docs]


def get_story_by_id(story_id: str) -> dict | None:
    db = get_database()
    try:
        story_oid = _to_object_id(story_id)
    except ValueError:
        return None

    story = db.stories.find_one({"_id": story_oid})
    if not story:
        return None
    return _serialize_story(story)


def get_story_for_owner_or_published(story_id: str, requester_id: str | None) -> dict | None:
    db = get_database()
    try:
        story_oid = _to_object_id(story_id)
    except ValueError:
        return None

    story = db.stories.find_one({"_id": story_oid})
    if not story:
        return None

    if _story_is_publicly_visible(story):
        return _serialize_story(story)

    if requester_id and str(story.get("user_id")) == requester_id:
        return _serialize_story(story)

    return None


def update_story(story_id: str, owner_id: str, payload: dict, cover_image_url: str | None = None) -> dict | None:
    db = get_database()
    oid = _to_object_id(story_id)
    user_oid = _to_object_id(owner_id)

    update_data = {k: v for k, v in payload.items() if v is not None}
    if cover_image_url is not None:
        update_data["cover_image_url"] = cover_image_url

    if not update_data:
        story = db.stories.find_one({"_id": oid, "user_id": user_oid})
        return _serialize_story(story) if story else None

    update_data["updated_at"] = datetime.utcnow()

    updated = db.stories.find_one_and_update(
        {"_id": oid, "user_id": user_oid},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        return None
    return _serialize_story(updated)


def delete_story(story_id: str, owner_id: str) -> bool:
    db = get_database()
    oid = _to_object_id(story_id)
    user_oid = _to_object_id(owner_id)

    story = db.stories.find_one({"_id": oid, "user_id": user_oid})
    if not story:
        return False

    db.chapters.delete_many({"story_id": oid})
    db.stories.delete_one({"_id": oid, "user_id": user_oid})
    return True


def publish_story(story_id: str, owner_id: str) -> dict | None:
    return update_story(story_id, owner_id, {"status": "published"})


def _next_chapter_number(story_oid: ObjectId) -> int:
    db = get_database()
    last = db.chapters.find_one({"story_id": story_oid}, sort=[("chapter_number", -1)])
    if not last:
        return 1
    return int(last.get("chapter_number", 0)) + 1


def create_chapter(story_id: str, owner_id: str, payload: dict) -> dict:
    db = get_database()
    story_oid = _to_object_id(story_id)
    user_oid = _to_object_id(owner_id)

    story = db.stories.find_one({"_id": story_oid, "user_id": user_oid})
    if not story:
        raise ValueError("Story not found or not owned by user")

    chapter_number = payload.get("chapter_number") or _next_chapter_number(story_oid)
    chapter_doc = {
        "story_id": story_oid,
        "user_id": user_oid,
        "title": payload["title"],
        "content": payload["content"],
        "chapter_number": chapter_number,
        "status": payload.get("status", "draft"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    inserted = db.chapters.insert_one(chapter_doc)
    chapter_doc["_id"] = inserted.inserted_id

    db.stories.update_one(
        {"_id": story_oid},
        {
            "$set": {"updated_at": datetime.utcnow()},
            "$inc": {"chapter_count": 1},
        },
    )

    return _serialize_chapter(chapter_doc)


def list_story_chapters(story_id: str, include_drafts: bool = False, owner_id: str | None = None) -> list[dict]:
    db = get_database()
    story_oid = _to_object_id(story_id)

    query: dict = {"story_id": story_oid}
    if not include_drafts:
        query["status"] = "published"

    if include_drafts and owner_id:
        story = db.stories.find_one({"_id": story_oid})
        if not story or str(story.get("user_id")) != owner_id:
            query["status"] = "published"

    docs = list(db.chapters.find(query).sort("chapter_number", 1))
    return [_serialize_chapter(d) for d in docs]


def get_chapter_by_id(chapter_id: str, requester_id: str | None = None) -> dict | None:
    db = get_database()
    chapter = db.chapters.find_one({"_id": _to_object_id(chapter_id)})
    if not chapter:
        return None

    if chapter.get("status") == "published":
        return _serialize_chapter(chapter)

    if requester_id and str(chapter.get("user_id")) == requester_id:
        return _serialize_chapter(chapter)

    return None


def update_chapter(chapter_id: str, owner_id: str, payload: dict) -> dict | None:
    db = get_database()
    chapter_oid = _to_object_id(chapter_id)
    user_oid = _to_object_id(owner_id)

    update_data = {k: v for k, v in payload.items() if v is not None}
    if not update_data:
        chapter = db.chapters.find_one({"_id": chapter_oid, "user_id": user_oid})
        return _serialize_chapter(chapter) if chapter else None

    update_data["updated_at"] = datetime.utcnow()

    updated = db.chapters.find_one_and_update(
        {"_id": chapter_oid, "user_id": user_oid},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        return None
    return _serialize_chapter(updated)


def delete_chapter(chapter_id: str, owner_id: str) -> bool:
    db = get_database()
    chapter_oid = _to_object_id(chapter_id)
    user_oid = _to_object_id(owner_id)

    chapter = db.chapters.find_one({"_id": chapter_oid, "user_id": user_oid})
    if not chapter:
        return False

    db.chapters.delete_one({"_id": chapter_oid, "user_id": user_oid})
    db.stories.update_one(
        {"_id": chapter["story_id"]},
        {
            "$set": {"updated_at": datetime.utcnow()},
            "$inc": {"chapter_count": -1},
        },
    )
    return True


def publish_chapter(chapter_id: str, owner_id: str) -> dict | None:
    return update_chapter(chapter_id, owner_id, {"status": "published"})
