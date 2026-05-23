from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.auth_service import get_user_by_id
from app.utils.jwt_handler import decode_token

security = HTTPBearer(auto_error=True)
optional_security = HTTPBearer(auto_error=False)


def _resolve_user_from_token(token: str):
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return _resolve_user_from_token(credentials.credentials)


def get_current_user_optional(credentials: HTTPAuthorizationCredentials | None = Depends(optional_security)):
    if not credentials:
        return None
    try:
        return _resolve_user_from_token(credentials.credentials)
    except HTTPException:
        return None
