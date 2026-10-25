from datetime import datetime, timedelta
import secrets
import re

import bcrypt
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.database import get_database
from app.utils.jwt_handler import create_access_token, create_refresh_token, decode_token
from app.utils.email import send_password_reset_email


def hash_password(password: str) -> bytes:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())


def verify_password(password: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed)


def _serialize_user(user: dict) -> dict:
    avatar_url = f"/api/users/{user['_id']}/avatar-image" if user.get("avatar_image") is not None else user.get("avatar_url", "")
    return {
        "_id": str(user["_id"]),
        "email": user["email"],
        "username": user["username"],
        "bio": user.get("bio", ""),
        "avatar_url": avatar_url,
        "created_at": user.get("created_at"),
    }


def create_user(email: str, username: str, password: str):
    db = get_database()
    users = db.users

    email = email.lower().strip()
    username_clean = (username or "").strip()

    if not username_clean:
        raise ValueError("Username is required")

    # Check if username already exists (case-insensitive)
    existing_username = users.find_one({"username": {"$regex": f"^{re.escape(username_clean)}$", "$options": "i"}})
    if existing_username:
        raise ValueError("Username already exists. Please choose another.")

    hashed = hash_password(password)
    user_doc = {
        "email": email,
        "username": username_clean,
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
        raise ValueError("Email or username is already registered")


def authenticate_user(email: str, password: str):
    db = get_database()
    users = db.users
    user = users.find_one({"email": email.lower().strip()})
    if not user:
        return {"error": "Account does not exist, need to signup first"}
    if not verify_password(password, user["password"]):
        return {"error": "Incorrect password"}
    # Basic email format check for clearer message
    email_clean = email.lower().strip()
    if '@' not in email_clean or '.' not in email_clean.split('@')[-1]:
        # still don't block normal flow, but keep explicit message if needed elsewhere
        pass

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


def request_password_reset(email: str):
    db = get_database()
    users = db.users
    user = users.find_one({"email": email.lower().strip()})
    if not user:
        raise ValueError("Account does not exist, need to signup first")
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    db.password_reset_tokens.update_one(
        {"user_id": user["_id"]},
        {"$set": {"token": token, "expires_at": expires_at, "used": False}},
        upsert=True
    )
    
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    email_sent = send_password_reset_email(user["email"], reset_link)
    
    if email_sent:
        return {"message": "Password reset link sent to your email.", "reset_link": reset_link}
    # If SMTP is configured but sending failed
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        raise ValueError("Failed to send password reset email. Please try again later.")
    # SMTP not configured - in development, return the link so user can reset password
    if settings.DEBUG:
        return {"message": "Password reset link sent to your email.", "reset_link": reset_link}
    # In production without SMTP configured
    raise ValueError("Email service not configured. Please contact support.")


def reset_password(token: str, new_password: str):
    db = get_database()
    tokens = db.password_reset_tokens
    users = db.users
    
    token_doc = tokens.find_one({"token": token, "used": {"$ne": True}})
    if not token_doc:
        raise ValueError("Invalid or expired reset token")
    
    if token_doc.get("expires_at") and token_doc["expires_at"] < datetime.utcnow():
        raise ValueError("Invalid or expired reset token")
    
    user_id = token_doc["user_id"]
    hashed = hash_password(new_password)
    
    users.update_one({"_id": user_id}, {"$set": {"password": hashed, "updated_at": datetime.utcnow()}})
    tokens.update_one({"_id": token_doc["_id"]}, {"$set": {"used": True}})
    
    return {"message": "Password updated successfully"}
