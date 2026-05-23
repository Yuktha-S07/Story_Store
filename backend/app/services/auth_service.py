from datetime import datetime, timedelta

import bcrypt
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.database import get_database
from app.utils.jwt_handler import create_access_token, create_refresh_token, decode_token


def hash_password(password: str) -> bytes:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())


def verify_password(password: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed)


def _serialize_user(user: dict) -> dict:
    return {
        "_id": str(user["_id"]),
        "email": user["email"],
        "username": user["username"],
        "bio": user.get("bio", ""),
        "avatar_url": user.get("avatar_url", ""),
        "created_at": user.get("created_at"),
    }


def create_user(email: str, username: str, password: str):
    db = get_database()
    users = db.users

    hashed = hash_password(password)
    user_doc = {
        "email": email,
        "username": username,
        "password": hashed,
        "bio": "",
        "avatar_url": "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:
        res = users.insert_one(user_doc)
        user_doc["_id"] = res.inserted_id
        return _serialize_user(user_doc)
    except DuplicateKeyError:
        raise ValueError("Email is already registered")


def authenticate_user(email: str, password: str):
    db = get_database()
    users = db.users
    user = users.find_one({"email": email})
    if not user:
        return None
    if not verify_password(password, user["password"]):
        return None

    payload = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "username": user["username"],
    }
    access_token = create_access_token(payload, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    refresh_token = create_refresh_token(payload, expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": _serialize_user(user),
    }


def refresh_access_token(refresh_token: str):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        return None

    new_payload = {
        "sub": payload.get("sub"),
        "email": payload.get("email"),
        "username": payload.get("username"),
    }
    return create_access_token(new_payload)


def get_user_by_id(user_id: str):
    db = get_database()
    users = db.users
    user = users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None
    return _serialize_user(user)
