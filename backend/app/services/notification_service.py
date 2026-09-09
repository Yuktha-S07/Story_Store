from datetime import datetime
import asyncio

from bson import ObjectId

from ..database import get_database

DEFAULT_PREFERENCES = {
    "comments": True,
    "messages": True,
    "likes": True,
    "votes": True,
}

VALID_SOUNDS = {"chime", "pop", "sparkle", "pulse", "whistle"}


def _id_values(value: str) -> list:
    values = [value]
    if ObjectId.is_valid(str(value)):
        values.insert(0, ObjectId(str(value)))
    return values


def get_preferences(user_id: str) -> dict:
    user = get_database().users.find_one({"_id": {"$in": _id_values(user_id)}}, {"notification_preferences": 1, "notification_sound": 1})
    stored = (user or {}).get("notification_preferences", {})
    toggles = {key: bool(stored.get(key, default)) for key, default in DEFAULT_PREFERENCES.items()}
    sound = (user or {}).get("notification_sound") or stored.get("sound") or "chime"
    if sound not in VALID_SOUNDS:
        sound = "chime"
    toggles["sound"] = sound
    return toggles


def update_preferences(user_id: str, preferences: dict) -> dict:
    cleaned = {
        key: bool(preferences.get(key, DEFAULT_PREFERENCES[key]))
        for key in DEFAULT_PREFERENCES
    }
    sound = preferences.get("sound", "chime")
    if sound not in VALID_SOUNDS:
        sound = "chime"
    cleaned["sound"] = sound
    get_database().users.update_one(
        {"_id": {"$in": _id_values(user_id)}},
        {
            "$set": {
                "notification_preferences": cleaned,
                "notification_sound": sound,
                "updated_at": datetime.utcnow(),
            }
        },
    )
    return cleaned


def _safe_send_push(recipient_id: str, document: dict) -> None:
    from .push_service import send_push
    try:
        send_push(recipient_id, document)
    except Exception:
        pass


def _dispatch_push(recipient_id: str, document: dict) -> None:
    """Send the push notification without blocking the request handler.

    webpush() performs network I/O with a multi-second timeout per device, so it
    must never run synchronously inside an async endpoint.
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        _safe_send_push(recipient_id, document)
        return
    loop.run_in_executor(None, _safe_send_push, recipient_id, document)


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

    _dispatch_push(recipient_id, document)
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
