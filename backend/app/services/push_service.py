"""Web Push (VAPID) subscription management and dispatch.

Push notifications let users receive system/browser notifications even
when they are not on the website. Subscriptions are stored per user in the
``push_subscriptions`` collection.
"""

import json
import logging
from datetime import datetime

from bson import ObjectId

from app.config import settings
from app.database import get_database, get_push_subscriptions_collection

logger = logging.getLogger("storystore.push")


def _user_id_values(user_id: str) -> list:
    as_str = str(user_id)
    values = [as_str]
    if ObjectId.is_valid(as_str):
        values.insert(0, ObjectId(as_str))
    return values


def _recipient_query(user_id: str) -> dict:
    return {"recipient_id": {"$in": _user_id_values(user_id)}}


def save_subscription(user_id: str, subscription: dict) -> dict:
    endpoint = subscription.get("endpoint", "")
    if not endpoint:
        raise ValueError("Subscription is missing an endpoint")
    user_key = str(user_id)
    document = {
        "recipient_id": user_key,
        "endpoint": endpoint,
        "keys": subscription.get("keys", {}),
        "expiration_time": subscription.get("expirationTime"),
        "created_at": datetime.utcnow(),
    }
    collection = get_push_subscriptions_collection()
    collection.delete_many(
        {
            "endpoint": endpoint,
            "recipient_id": {"$in": _user_id_values(user_id), "$ne": user_key},
        }
    )
    collection.update_one(
        {"recipient_id": user_key, "endpoint": endpoint},
        {"$set": document},
        upsert=True,
    )
    return document


def delete_subscription(user_id: str, endpoint: str | None = None) -> int:
    query: dict = _recipient_query(user_id)
    if endpoint:
        query["endpoint"] = endpoint
    result = get_push_subscriptions_collection().delete_many(query)
    return result.deleted_count


def list_subscriptions(user_id: str) -> list[dict]:
    return list(
        get_push_subscriptions_collection().find(
            _recipient_query(user_id)
        )
    )


def _notification_url(base: str, document: dict) -> str:
    story_id = document.get("story_id")
    base = base.rstrip("/")
    if story_id:
        return f"{base}/stories/{story_id}"
    return f"{base}/"


def send_push(recipient_id: str, document: dict) -> None:
    """Send a browser push notification to all of a user's devices."""
    private_key = settings.VAPID_PRIVATE_KEY
    subject = settings.VAPID_SUBJECT_EMAIL
    if not private_key:
        logger.warning("VAPID_PRIVATE_KEY is not configured; skipping push")
        return

    user = get_database().users.find_one(
        {"_id": {"$in": _user_id_values(recipient_id)}},
        {"notification_preferences": 1, "notification_sound": 1},
    ) or {}
    stored_prefs = user.get("notification_preferences", {})
    sound = user.get("notification_sound") or stored_prefs.get("sound") or "chime"

    payload = {
        "title": "Story Store",
        "body": document.get("message", ""),
        "icon": "/favicon.svg",
        "badge": "/favicon.svg",
        "tag": str(document.get("_id", "")),
        "url": _notification_url(settings.FRONTEND_URL, document),
        "sound": sound,
    }

    try:
        from pywebpush import WebPushException, webpush
    except ImportError:
        logger.warning("pywebpush is not installed; skipping push")
        return

    vapid_claims = {"sub": subject or "mailto:no-reply@storystore.app"}

    subscriptions = list_subscriptions(recipient_id)
    collection = get_push_subscriptions_collection()
    for subscription in subscriptions:
        info = {
            "endpoint": subscription["endpoint"],
            "keys": subscription.get("keys", {}),
        }
        try:
            webpush(
                subscription_info=info,
                data=json.dumps(payload),
                vapid_private_key=private_key,
                vapid_claims=vapid_claims,
                ttl=60 * 24,
                timeout=5,
            )
        except WebPushException as exc:
            status = exc.status_code
            if status in (404, 410):
                collection.delete_one({"_id": subscription["_id"]})
            else:
                logger.warning("Push failed for %s: %s", info["endpoint"], exc)
        except Exception as exc:  # pragma: no cover - network noise
            logger.warning("Unexpected push error for %s: %s", info["endpoint"], exc)