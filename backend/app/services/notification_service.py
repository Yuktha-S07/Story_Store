from datetime import datetime

from bson import ObjectId

from ..database import get_database

DEFAULT_PREFERENCES = {
    "comments": True,
    "messages": True,
    "likes": True,
    "votes": True,
}


def _id_values(value: str) -> list:
    values = [value]
    if ObjectId.is_valid(str(value)):
        values.insert(0, ObjectId(str(value)))
    return values


def get_preferences(user_id: str) -> dict:
    user = get_database().users.find_one({"_id": {"$in": _id_values(user_id)}}, {"notification_preferences": 1})
    stored = (user or {}).get("notification_preferences", {})
    return {key: bool(stored.get(key, default)) for key, default in DEFAULT_PREFERENCES.items()}


def update_preferences(user_id: str, preferences: dict) -> dict:
    cleaned = {
        key: bool(preferences.get(key, DEFAULT_PREFERENCES[key]))
        for key in DEFAULT_PREFERENCES
    }
    get_database().users.update_one(
        {"_id": {"$in": _id_values(user_id)}},
        {"$set": {"notification_preferences": cleaned, "updated_at": datetime.utcnow()}},
    )
    return cleaned


def create_notification(
    recipient_id: str,
    notification_type: str,
    message: str,
    actor_id: str | None = None,
    actor_name: str = "Someone",
    story_id: str | None = None,
    story_title: str = "",
) -> dict | None:
    if notification_type not in DEFAULT_PREFERENCES or not get_preferences(recipient_id).get(notification_type, True):
        return None

    document = {
        "recipient_id": ObjectId(recipient_id),
        "type": notification_type,
        "message": message,
        "actor_id": ObjectId(actor_id) if actor_id and ObjectId.is_valid(str(actor_id)) else None,
        "actor_name": actor_name,
        "story_id": ObjectId(story_id) if story_id and ObjectId.is_valid(str(story_id)) else None,
        "story_title": story_title,
        "read": False,
        "created_at": datetime.utcnow(),
    }
    result = get_database().notifications.insert_one(document)
    document["_id"] = result.inserted_id

    from .push_service import send_push
    try:
        send_push(recipient_id, document)
    except Exception:
        pass
    return document


def list_notifications(user_id: str, limit: int = 30) -> list[dict]:
    documents = list(
        get_database().notifications.find(
            {"recipient_id": {"$in": _id_values(user_id)}}
        ).sort("created_at", -1).limit(max(1, min(limit, 100)))
    )
    return [
        {
            "_id": str(item["_id"]),
            "type": item.get("type", "info"),
            "message": item.get("message", ""),
            "actor_id": str(item["actor_id"]) if item.get("actor_id") else None,
            "actor_name": item.get("actor_name", "Someone"),
            "story_id": str(item["story_id"]) if item.get("story_id") else None,
            "story_title": item.get("story_title", ""),
            "read": bool(item.get("read", False)),
            "created_at": item.get("created_at"),
        }
        for item in documents
    ]


def mark_notifications_read(user_id: str) -> None:
    get_database().notifications.update_many(
        {"recipient_id": {"$in": _id_values(user_id)}, "read": False},
        {"$set": {"read": True}},
    )
