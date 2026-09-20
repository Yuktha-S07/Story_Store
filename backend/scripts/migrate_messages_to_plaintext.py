"""
Migrate previously-encrypted messages to plaintext so no environment key is
needed to read them. Messages that still decrypt successfully are stored as
plain text (is_encrypted=False, iv removed). Messages that cannot be decrypted
with the current key(s) are left untouched.

Run with the backend venv python from repo root:

    & venv\Scripts\python.exe backend/scripts/migrate_messages_to_plaintext.py
"""
import sys
import os
import traceback

from pymongo import MongoClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.utils.message_encryption import decrypt_content

MONGO = os.getenv("MONGODB_URI", "mongodb://localhost:27017/story_store")

client = MongoClient(MONGO)
db = client[os.getenv("DATABASE_NAME", "story_store")]
messages = db.messages

migrated = 0
skipped = 0
failed = 0

for msg in messages.find({"is_encrypted": True, "iv": {"$ne": None}}):
    try:
        plain = decrypt_content(msg.get("content", ""), msg.get("iv"))
    except Exception:
        failed += 1
        traceback.print_exc()
        continue

    if plain == "[Unable to decrypt this message]":
        skipped += 1
        continue

    messages.update_one(
        {"_id": msg["_id"]},
        {"$set": {"content": plain, "is_encrypted": False, "iv": None}},
    )
    migrated += 1

print(f"Migrated {migrated} message(s) to plaintext, skipped {skipped} undecryptable, failed {failed}.")