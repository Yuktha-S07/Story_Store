from bson import ObjectId
from fastapi import HTTPException, status
from starlette.concurrency import run_in_threadpool
from typing import List
from datetime import datetime

from ..models.message import Message
from ..database import (
    get_message_collection,
    get_user_collection,
)
from ..utils.message_encryption import decrypt_content
from .notification_service import create_notification


def _id_query_values(value: str) -> list:
    values = [value]
    if ObjectId.is_valid(value):
        values.insert(0, ObjectId(value))
    return values


def _safe_str(value) -> str:
    return str(value) if value is not None else ""


def _serialize_reactions(reactions) -> list[dict]:
    return [
        {
            "user_id": str(r.get("user_id", "")),
            "emoji": r.get("emoji", ""),
            "created_at": r.get("created_at"),
        }
        for r in reactions or []
    ]


class MessageService:
    def __init__(self):
        self.message_collection = get_message_collection()

    async def send_message(self, sender_id: str, recipient_id: str, content: str, message_type: str = "text") -> dict:
        recipient = get_user_collection().find_one({"_id": {"$in": _id_query_values(recipient_id)}})
        if not recipient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")

        message = Message(
            sender_id=ObjectId(sender_id),
            recipient_id=ObjectId(recipient_id),
            content=content,
            message_type=message_type,
        )
        self.message_collection.insert_one(message.model_dump(by_alias=True))
        sender = get_user_collection().find_one({"_id": {"$in": _id_query_values(sender_id)}}, {"username": 1})
        create_notification(
            recipient_id=recipient_id,
            notification_type="messages",
            message=f"{(sender or {}).get('username', 'Someone')} sent you {'a sticker' if message_type == 'sticker' else 'a message'}.",
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
                {"sender_id": 1, "recipient_id": 1, "content": 1, "message_type": 1, "iv": 1, "is_encrypted": 1, "created_at": 1, "updated_at": 1, "read_at": 1, "reactions": 1},
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
                "message_type": msg.get("message_type", "text"),
                "created_at": msg.get("created_at"),
                "updated_at": msg.get("updated_at"),
                "read_at": msg.get("read_at"),
                "iv": None,
                "is_encrypted": False,
                "is_mine": str(msg["sender_id"]) == str(user_id),
                "reactions": _serialize_reactions(msg.get("reactions")),
            })

        if mark_read:
            self.message_collection.update_many(
                {"sender_id": {"$in": other_variants}, "recipient_id": {"$in": user_variants}, "read_at": None},
                {"$set": {"read_at": datetime.utcnow()}},
            )

        return results

    async def get_unread_count(self, user_id: str) -> int:
        return self.message_collection.count_documents({"recipient_id": {"$in": _id_query_values(user_id)}, "read_at": None})

    async def edit_message(self, user_id: str, message_id: str, content: str) -> dict:
        message = self.message_collection.find_one(
            {"_id": {"$in": _id_query_values(message_id)}, "sender_id": {"$in": _id_query_values(user_id)}}
        )
        if not message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

        if message.get("message_type", "text") != "text":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stickers cannot be edited")

        self.message_collection.update_one(
            {"_id": message["_id"]},
            {
                "$set": {
                    "content": content,
                    "updated_at": datetime.utcnow(),
                    "is_encrypted": False,
                    "iv": None,
                }
            },
        )
        return {"message": "Message updated successfully"}

    async def toggle_reaction(self, user_id: str, message_id: str, emoji: str) -> dict:
        return await run_in_threadpool(self._toggle_reaction_sync, user_id, message_id, emoji)

    def _toggle_reaction_sync(self, user_id: str, message_id: str, emoji: str) -> dict:
        user_variants = _id_query_values(user_id)
        user_ref = str(user_id)
        message = self.message_collection.find_one(
            {
                "_id": {"$in": _id_query_values(message_id)},
                "$or": [
                    {"sender_id": {"$in": user_variants}},
                    {"recipient_id": {"$in": user_variants}},
                ],
            },
            {"reactions": 1},
        )
        if not message:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

        current = list(message.get("reactions") or [])
        own = {"user_id": user_ref, "emoji": emoji}
        has_reaction = any(
            str(r.get("user_id")) == user_ref and r.get("emoji") == emoji
            for r in current
        )

        if has_reaction:
            result = self.message_collection.update_one(
                {"_id": message["_id"], "reactions": {"$elemMatch": own}},
                {"$pull": {"reactions": own}},
            )
            if result.modified_count:
                current = [
                    r for r in current
                    if not (str(r.get("user_id")) == user_ref and r.get("emoji") == emoji)
                ]
        else:
            reaction = {"user_id": user_ref, "emoji": emoji, "created_at": datetime.utcnow()}
            result = self.message_collection.update_one(
                {"_id": message["_id"], "reactions": {"$not": {"$elemMatch": own}}},
                {"$push": {"reactions": reaction}},
            )
            if result.modified_count:
                current = [*current, reaction]

        if not result.modified_count:
            # A concurrent toggle changed the document first; re-read the
            # authoritative state instead of trusting our earlier snapshot.
            fresh = self.message_collection.find_one({"_id": message["_id"]}, {"reactions": 1})
            current = list((fresh or {}).get("reactions") or [])

        reactions = _serialize_reactions(current)
        still_present = any(
            r["user_id"] == user_ref and r["emoji"] == emoji for r in reactions
        )
        return {"action": "added" if still_present else "removed", "reactions": reactions}


def get_message_service() -> MessageService:
    return MessageService()
