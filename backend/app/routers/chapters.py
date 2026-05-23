from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.middleware.auth_middleware import get_current_user, get_current_user_optional
from app.models.chapter import ChapterCreate, ChapterUpdate
from app.services.story_service import (
    create_chapter,
    delete_chapter,
    get_chapter_by_id,
    list_story_chapters,
    publish_chapter,
    update_chapter,
)

router = APIRouter()


@router.get("/chapters")
async def list_user_chapters(
    mine: bool = Query(default=False),
    current_user: dict | None = Depends(get_current_user_optional),
):
    if mine and not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    if mine:
        # Get all chapters for the current user
        from app.database import get_database
        from app.services.story_service import _serialize_chapter, _to_object_id
        db = get_database()
        user_id = _to_object_id(current_user["_id"])
        chapters = list(db.chapters.find({"user_id": user_id}))
        return [_serialize_chapter(ch) for ch in chapters]
    
    return []


@router.post("/stories/{story_id}/chapters", status_code=status.HTTP_201_CREATED)
async def create_chapter_endpoint(
    story_id: str,
    payload: ChapterCreate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return create_chapter(story_id, current_user["_id"], payload.model_dump())
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))


@router.get("/stories/{story_id}/chapters")
async def list_story_chapters_endpoint(
    story_id: str,
    include_drafts: bool = Query(default=False),
    current_user: dict | None = Depends(get_current_user_optional),
):
    owner_id = current_user["_id"] if current_user else None
    return list_story_chapters(story_id, include_drafts=include_drafts, owner_id=owner_id)


@router.get("/chapters/{chapter_id}")
async def get_chapter_endpoint(
    chapter_id: str,
    current_user: dict | None = Depends(get_current_user_optional),
):
    requester_id = current_user["_id"] if current_user else None
    chapter = get_chapter_by_id(chapter_id, requester_id=requester_id)
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return chapter


@router.put("/chapters/{chapter_id}")
async def update_chapter_endpoint(
    chapter_id: str,
    payload: ChapterUpdate,
    current_user: dict = Depends(get_current_user),
):
    updated = update_chapter(chapter_id, current_user["_id"], payload.model_dump())
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return updated


@router.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter_endpoint(
    chapter_id: str,
    current_user: dict = Depends(get_current_user),
):
    deleted = delete_chapter(chapter_id, current_user["_id"])
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return None


@router.post("/chapters/{chapter_id}/publish")
async def publish_chapter_endpoint(
    chapter_id: str,
    current_user: dict = Depends(get_current_user),
):
    published = publish_chapter(chapter_id, current_user["_id"])
    if not published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return published
