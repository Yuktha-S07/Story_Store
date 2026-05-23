from fastapi import APIRouter, HTTPException, status, Depends

from app.middleware.auth_middleware import get_current_user
from app.models.user import RefreshTokenRequest, UserCreate, UserLogin
from app.services.auth_service import authenticate_user, create_user, refresh_access_token

router = APIRouter()


@router.post('/register')
async def register(payload: UserCreate):
    try:
        user = create_user(payload.email, payload.username, payload.password)
        return {"message": "user_created", "user": user}
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post('/login')
async def login(payload: UserLogin):
    res = authenticate_user(payload.email, payload.password)
    if not res:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    return {
        "access_token": res["access_token"],
        "refresh_token": res["refresh_token"],
        "token_type": "bearer",
        "user": res["user"],
    }


@router.post('/refresh')
async def refresh(payload: RefreshTokenRequest):
    new_access_token = refresh_access_token(payload.refresh_token)
    if not new_access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid refresh token')
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }


@router.post('/logout')
async def logout(_user: dict = Depends(get_current_user)):
    # Stateless JWT logout; client should drop tokens.
    return {"message": "logged_out"}


@router.get('/me')
async def me(user: dict = Depends(get_current_user)):
    return user
