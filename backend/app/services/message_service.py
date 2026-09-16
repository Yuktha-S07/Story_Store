from bson import ObjectId
from fastapi import HTTPException, status
from typing import List
from datetime import datetime

from ..models.message import Message
from ..database import (
    get_message_collection,
    get_user_collection,
)
from ..utils.message_encryption import encrypt_content, decrypt_content
from .notification_service import create_notification


def _id_query_values(value: str) -> list:
    values = [value]
    if ObjectId.is_valid(value):
        values.insert(0, ObjectId(value))
    return values


def _safe_str(value) -> str:
    return str(value) if value is not None else ""


class MessageService:
    def __init__(self):
        self.message_collection = get_message_collection()

    async def send_message(self, sender_id: str, recipient_id: str, content: str) -> dict:
        recipient = get_user_collection().find_one({"_id": {"$in": _id_query_values(recipient_id)}})
        if not recipient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")

        encrypted_content, nonce = encrypt_content(content)

        message = Message(
            sender_id=ObjectId(sender_id),
            recipient_id=ObjectId(recipient_id),
            content=encrypted_content,
            iv=nonce,
            is_encrypted=True,
        )
        self.message_collection.insert_one(message.model_dump(by_alias=True))
        sender = get_user_collection().find_one({"_id": {"$in": _id_query_values(sender_id)}}, {"username": 1})
        create_notification(
            recipient_id=recipient_id,
            notification_type="messages",
            message=f"{(sender or {}).get('username', 'Someone')} sent you a message.",
            actor_id=sender_id,
            actor_name=(sender or {}).get("username", "Someone"),
        )
        return {"message": "Message sent successfully"}

    async def list_conversations(self, user_id: str, direction: str = "all") -> list[dict]:
        user_variants = _id_query_values(user_id)
        messages = list(
            self.message_collection.find(
                {"$or": [{"sender_id": {"$in": user_variants}}, {"recipient_id": {"$in": user_variants}}]},
                {"sender_id": 1, "recipient_id": 1, "content": 1, "iv": 1, "is_encrypted": 1, "created_at": 1, "read_at": 1},
            ).sort("created_at", 1)
        )

        conversations = {}
        order = []
        for msg in messages:
            other_id = msg["recipient_id"] if str(msg.get("sender_id")) == str(user_id) else msg["sender_id"]
            other_key = str(other_id)
            is_mine = str(msg.get("sender_id")) == str(user_id)
            if other_key not in conversations:
                conversations[other_key] = {
                    "user_id": other_key,
                    "username": "Unknown",
                    "last_message": "",
                    "last_message_at": None,
                    "last_is_mine": False,
                    "sent_count": 0,
                    "received_count": 0,
                    "unread_count": 0,
                }
                order.append(other_key)
            conv = conversations[other_key]
            if is_mine:
                conv["sent_count"] += 1
            else:
                conv["received_count"] += 1
                if msg.get("read_at") is None:
                    conv["unread_count"] += 1
            last_content = msg.get("content", "")
            last_is_encrypted = bool(msg.get("is_encrypted", False))
            last_nonce = msg.get("iv")
            if last_is_encrypted and last_nonce:
                last_content = decrypt_content(last_content, last_nonce)
            conv["last_message"] = last_content
            conv["last_message_at"] = msg.get("created_at")
            conv["last_is_mine"] = is_mine
            conv["last_encrypted"] = bool(msg.get("is_encrypted", False))

        results = [conversations[k] for k in order]
        if direction == "sent":
            results = [c for c in results if c["sent_count"] > 0]
        elif direction == "received":
            results = [c for c in results if c["received_count"] > 0]

        results.sort(key=lambda c: c["last_message_at"] or datetime.min, reverse=True)

        usernames = self._load_usernames(order)
        for conv in results:
            conv["username"] = usernames.get(conv["user_id"], "Unknown")

        return results

    def _load_usernames(self, user_ids: list[str]) -> dict:
        """Resolve usernames for many user ids with a single query."""
        oids = []
        for uid in user_ids:
            if ObjectId.is_valid(uid):
                oids.append(ObjectId(uid))
        usernames = {}
        if oids:
            for user in get_user_collection().find({"_id": {"$in": list(set(oids))}}, {"username": 1}):
                usernames[str(user["_id"])] = user.get("username", "Unknown")
        return usernames

    async def get_thread(self, user_id: str, other_id: str, mark_read: bool = True) -> list[dict]:
        user_variants = _id_query_values(user_id)
        other_variants = _id_query_values(other_id)
        messages = list(
            self.message_collection.find(
                {
                    "$or": [
                        {"sender_id": {"$in": user_variants}, "recipient_id": {"$in": other_variants}},
                        {"sender_id": {"$in": other_variants}, "recipient_id": {"$in": user_variants}},
                    ]
                },
                {"sender_id": 1, "recipient_id": 1, "content": 1, "iv": 1, "is_encrypted": 1, "created_at": 1, "read_at": 1},
            ).sort("created_at", 1)
        )

        results = []
        for msg in messages:
            content = msg.get("content", "")
            is_encrypted = bool(msg.get("is_encrypted", False))
            nonce = msg.get("iv")
            if is_encrypted and nonce:
                content = decrypt_content(content, nonce)

            results.append({
                "_id": str(msg["_id"]),
                "sender_id": str(msg["sender_id"]),
                "recipient_id": str(msg["recipient_id"]),
                "content": content,
                "created_at": msg.get("created_at"),
                "read_at": msg.get("read_at"),
                "iv": None,
                "is_encrypted": False,
                "is_mine": str(msg["sender_id"]) == str(user_id),
            })

        if mark_read:
            self.message_collection.update_many(
                {"sender_id": {"$in": other_variants}, "recipient_id": {"$in": user_variants}, "read_at": None},
                {"$set": {"read_at": datetime.utcnow()}},
            )

        return results

    async def get_unread_count(self, user_id: str) -> int:
        return self.message_collection.count_documents({"recipient_id": {"$in": _id_query_values(user_id)}, "read_at": None})


def get_message_service() -> MessageService:
    return MessageService()
