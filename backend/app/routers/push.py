from fastapi import APIRouter, Body, Depends, HTTPException

from app.config import settings
from app.middleware.auth_middleware import get_current_user
from app.services.push_service import (
    delete_subscription,
    save_subscription,
)

router = APIRouter()


@router.get("/push/vapid-public-key")
async def get_vapid_public_key():
    """Return the VAPID public key used to sign push messages."""
    if not settings.VAPID_PUBLIC_KEY:
        raise HTTPException(status_code=503, detail="Web Push is not configured")
    return {"publicKey": settings.VAPID_PUBLIC_KEY}


@router.get("/push/subscriptions")
async def get_subscriptions(current_user: dict = Depends(get_current_user)):
    """List the push subscriptions registered for the current user."""
    from app.services.push_service import list_subscriptions

    subscriptions = list_subscriptions(current_user["_id"])
    return {
        "subscriptions": [
            {
                "endpoint": item["endpoint"],
                "expirationTime": item.get("expiration_time"),
            }
            for item in subscriptions
        ]
    }


@router.post("/push/subscriptions")
async def create_subscription(
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Register (or refresh) a browser push subscription for the current user."""
    try:
        save_subscription(current_user["_id"], payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"message": "Push subscription saved"}


@router.delete("/push/subscriptions")
async def remove_subscription(
    endpoint: str = "",
    current_user: dict = Depends(get_current_user),
):
    delete_subscription(current_user["_id"], endpoint or None)
    return {"message": "Push subscription removed"}