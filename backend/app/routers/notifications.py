from fastapi import APIRouter, Body, Depends

from ..middleware.auth_middleware import get_current_user
from ..services.notification_service import (
    get_preferences,
    list_notifications,
    mark_notifications_read,
    update_preferences,
)

router = APIRouter()


@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    items = list_notifications(current_user["_id"])
    return {"notifications": items, "unread_count": sum(1 for item in items if not item["read"])}


@router.post("/notifications/read")
async def read_notifications(current_user: dict = Depends(get_current_user)):
    mark_notifications_read(current_user["_id"])
    return {"message": "Notifications marked as read"}


@router.get("/notifications/preferences")
async def get_notification_preferences(current_user: dict = Depends(get_current_user)):
    return get_preferences(current_user["_id"])


@router.put("/notifications/preferences")
async def save_notification_preferences(
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    return update_preferences(current_user["_id"], payload)
