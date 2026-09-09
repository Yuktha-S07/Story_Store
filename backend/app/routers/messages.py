from fastapi import APIRouter, Body, Depends, HTTPException, status
from typing import List

from ..services.message_service import MessageService, get_message_service
from ..middleware.auth_middleware import get_current_user

router = APIRouter()


@router.post("/messages", status_code=status.HTTP_201_CREATED)
async def send_message(
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
    message_service: MessageService = Depends(get_message_service),
):
    recipient_id = (payload.get("recipient_id") or "").strip()
    content = (payload.get("content") or "").strip()
    if not recipient_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recipient is required")
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message content is required")
    if recipient_id == current_user["_id"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot message yourself")
    return await message_service.send_message(current_user["_id"], recipient_id, content)


@router.get("/messages/conversations")
async def get_conversations(
    direction: str = "all",
    current_user: dict = Depends(get_current_user),
    message_service: MessageService = Depends(get_message_service),
):
    if direction not in ("all", "sent", "received"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid direction")
    return await message_service.list_conversations(current_user["_id"], direction)


@router.get("/messages/unread-count")
async def get_unread(
    current_user: dict = Depends(get_current_user),
    message_service: MessageService = Depends(get_message_service),
):
    count = await message_service.get_unread_count(current_user["_id"])
    return {"unread_count": count}


@router.get("/messages/with/{other_id}")
async def get_thread(
    other_id: str,
    current_user: dict = Depends(get_current_user),
    message_service: MessageService = Depends(get_message_service),
):
    return await message_service.get_thread(current_user["_id"], other_id)
