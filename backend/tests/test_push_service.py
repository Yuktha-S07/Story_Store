import os
import pytest
from bson import ObjectId

os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017/story_store_test")
os.environ.setdefault("VAPID_PUBLIC_KEY", "x")
os.environ.setdefault("VAPID_PRIVATE_KEY", "y")
os.environ.setdefault("VAPID_SUBJECT_EMAIL", "mailto:test@storystore.test")

from app import database
from app.services import push_service


@pytest.fixture(scope="module")
def db_ready():
    database.connect_to_mongodb()
    db = database.get_database()
    db.push_subscriptions.delete_many({})
    yield db
    db.push_subscriptions.delete_many({})
    database.disconnect_from_mongodb()


def test_save_and_list_subscriptions(db_ready):
    sub = {
        "endpoint": "https://push.example.com/dev1",
        "expirationTime": None,
        "keys": {"p256dh": "a" * 43, "auth": "b" * 22},
    }
    push_service.save_subscription("user-1", sub)
    push_service.save_subscription("user-1", sub)

    subs = push_service.list_subscriptions("user-1")
    assert len(subs) == 1
    assert subs[0]["endpoint"] == sub["endpoint"]


def test_delete_subscription(db_ready):
    sub = {
        "endpoint": "https://push.example.com/dev2",
        "expirationTime": None,
        "keys": {"p256dh": "c" * 43, "auth": "d" * 22},
    }
    push_service.save_subscription("user-1", sub)
    assert len(push_service.list_subscriptions("user-1")) == 2

    deleted = push_service.delete_subscription("user-1", sub["endpoint"])
    assert deleted == 1
    assert len(push_service.list_subscriptions("user-1")) == 1


def test_subscription_lookup_across_id_formats(db_ready):
    user_id = ObjectId()
    sub = {
        "endpoint": "https://push.example.com/dev4",
        "expirationTime": None,
        "keys": {"p256dh": "g" * 43, "auth": "h" * 22},
    }
    push_service.save_subscription(user_id, sub)
    assert len(push_service.list_subscriptions(str(user_id))) == 1

    push_service.save_subscription(str(user_id), sub)
    assert len(push_service.list_subscriptions(user_id)) == 1


def test_send_push_does_not_raise(db_ready):
    push_service.save_subscription(
        "user-1",
        {
            "endpoint": "https://push.example.com/dev3",
            "expirationTime": None,
            "keys": {"p256dh": "e" * 43, "auth": "f" * 22},
        },
    )
    push_service.send_push(
        "user-1",
        {"_id": "xyz", "message": "Hello", "story_id": None},
    )
    assert len(push_service.list_subscriptions("user-1")) >= 1