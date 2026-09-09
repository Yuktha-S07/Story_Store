from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from bson import ObjectId
from datetime import datetime
from pymongo.errors import DuplicateKeyError

from app.database import get_database
from app.middleware.auth_middleware import get_current_user
from app.models.user import ChangePasswordRequest, DeleteAccountRequest
from app.services.auth_service import get_user_by_id, hash_password, verify_password
from app.services.file_service import save_profile_image

router = APIRouter()


@router.put("/users/me/encryption-key")
async def update_encryption_key(
    payload: dict,
    current_user: dict = Depends(get_current_user),
):
    public_key = (payload.get("public_key") or "").strip()
    if not public_key:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="public_key is required")
    if len(public_key) > 4096:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="public_key is too long")

    db = get_database()
    db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {
            "encryption_public_key": public_key,
            "updated_at": datetime.utcnow(),
        }},
    )
    return {"message": "Encryption key updated successfully"}


@router.get("/users/{user_id}")
async def get_user_profile(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db = get_database()

    def _id_variants(value: str) -> list:
        variants = [value]
        if ObjectId.is_valid(value):
            variants.insert(0, ObjectId(value))
        return variants

    id_variants = _id_variants(user_id)
    followers_count = db.follows.count_documents({"following_id": {"$in": id_variants}})
    following_count = db.follows.count_documents({"follower_id": {"$in": id_variants}})
    story_count = db.stories.count_documents({"user_id": {"$in": id_variants}})

    return {
        **user,
        "followers_count": followers_count,
        "following_count": following_count,
        "story_count": story_count,
    }


@router.put("/users/{user_id}")
async def update_user_profile(
    user_id: str,
    username: str | None = Form(None),
    email: str | None = Form(None),
    bio: str | None = Form(None),
    avatar: UploadFile | None = File(None),
    current_user: dict = Depends(get_current_user),
):
    if current_user["_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot update another user's profile")

    db = get_database()
    update_data = {}

    if username is not None:
        username = username.strip()
        if len(username) < 3:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username must be at least 3 characters")
        update_data["username"] = username

    if email is not None:
        email = email.lower().strip()
        update_data["email"] = email

    if bio is not None:
        update_data["bio"] = bio

    if avatar is not None and avatar.filename:
        try:
            update_data["avatar_url"] = await save_profile_image(avatar)
        except ValueError as err:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))

    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    update_data["updated_at"] = datetime.utcnow()

    try:
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
        )
    except DuplicateKeyError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return get_user_by_id(user_id)


@router.put("/users/{user_id}/password")
async def change_password(
    user_id: str,
    payload: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    if current_user["_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot change another user's password")

    db = get_database()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not verify_password(payload.current_password, user["password"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    if verify_password(payload.new_password, user["password"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different from the current one")

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "password": hash_password(payload.new_password),
            "updated_at": datetime.utcnow(),
        }},
    )

    return {"message": "Password updated successfully"}


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user_account(
    user_id: str,
    payload: DeleteAccountRequest,
    current_user: dict = Depends(get_current_user),
):
    if current_user["_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another user's account")

    db = get_database()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password. Account was not deleted.")

    db.follows.delete_many({"follower_id": ObjectId(user_id)})
    db.follows.delete_many({"following_id": ObjectId(user_id)})

    story_ids = [s["_id"] for s in db.stories.find({"user_id": ObjectId(user_id)}, {"_id": 1})]
    if story_ids:
        db.chapters.delete_many({"story_id": {"$in": story_ids}})
        db.stories.delete_many({"user_id": ObjectId(user_id)})

    db.users.delete_one({"_id": ObjectId(user_id)})

    return {"message": "Account deleted successfully"}
