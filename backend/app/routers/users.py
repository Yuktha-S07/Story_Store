from fastapi import APIRouter, Body, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime

from app.database import get_database
from app.middleware.auth_middleware import get_current_user
from app.services.auth_service import get_user_by_id

router = APIRouter()


@router.get("/users/{user_id}")
async def get_user_profile(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db = get_database()
    followers_count = db.follows.count_documents({"following_id": ObjectId(user_id)})
    following_count = db.follows.count_documents({"follower_id": ObjectId(user_id)})
    story_count = db.stories.count_documents({"user_id": ObjectId(user_id)})

    return {
        **user,
        "followers_count": followers_count,
        "following_count": following_count,
        "story_count": story_count,
    }


@router.put("/users/{user_id}")
async def update_user_profile(
    user_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    if current_user["_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot update another user's profile")

    db = get_database()
    update_data = {}
    if "bio" in payload:
        update_data["bio"] = payload["bio"]
    if "avatar_url" in payload:
        update_data["avatar_url"] = payload["avatar_url"]

    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    update_data["updated_at"] = datetime.utcnow()

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
    )

    return get_user_by_id(user_id)


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user_account(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    if current_user["_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another user's account")

    db = get_database()

    db.follows.delete_many({"follower_id": ObjectId(user_id)})
    db.follows.delete_many({"following_id": ObjectId(user_id)})

    story_ids = [s["_id"] for s in db.stories.find({"user_id": ObjectId(user_id)}, {"_id": 1})]
    if story_ids:
        db.chapters.delete_many({"story_id": {"$in": story_ids}})
        db.stories.delete_many({"user_id": ObjectId(user_id)})

    db.users.delete_one({"_id": ObjectId(user_id)})

    return {"message": "Account deleted successfully"}
