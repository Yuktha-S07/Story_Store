from fastapi import APIRouter, Body, Depends, File, HTTPException, Query, UploadFile, status
from bson import ObjectId

from app.middleware.auth_middleware import get_current_user, get_current_user_optional
from app.models.story import StoryCreate, StoryUpdate
from app.services.file_service import save_cover_image
from app.services.story_service import (
    create_story,
    delete_story,
    get_story_for_owner_or_published,
    list_stories,
    publish_story,
    update_story,
)

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_story_endpoint(
    payload: StoryCreate = Body(...),
    current_user: dict = Depends(get_current_user),
):
    try:
        return create_story(current_user["_id"], payload.model_dump(), "")
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))


@router.get("")
async def list_stories_endpoint(
    mine: bool = Query(False),
    genre: str | None = Query(default=None),
    tag: str | None = Query(default=None),
    q: str | None = Query(default=None),
    status_value: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    current_user: dict | None = Depends(get_current_user_optional),
):
    user_id = current_user["_id"] if current_user else None
    return list_stories(
        user_id=user_id,
        mine=mine,
        genre=genre,
        tag=tag,
        q=q,
        status=status_value,
        limit=limit,
        skip=skip,
    )


@router.get("/{story_id}")
async def get_story_endpoint(
    story_id: str,
    current_user: dict | None = Depends(get_current_user_optional),
):
    if not ObjectId.is_valid(story_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")

    requester_id = current_user["_id"] if current_user else None
    story = get_story_for_owner_or_published(story_id, requester_id)
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")

    from app.services.story_service import list_story_chapters

    include_drafts = bool(requester_id and requester_id == story["user_id"])
    story["chapters"] = list_story_chapters(story_id, include_drafts=include_drafts, owner_id=requester_id)
    return story


@router.put("/{story_id}")
async def update_story_endpoint(
    story_id: str,
    payload: StoryUpdate,
    current_user: dict = Depends(get_current_user),
):
    try:
        updated = update_story(story_id, current_user["_id"], payload.model_dump(), None)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
        return updated
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))


@router.post("/{story_id}/cover")
async def upload_cover_endpoint(
    story_id: str,
    cover_image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    try:
        cover_url = await save_cover_image(cover_image)
        updated = update_story(story_id, current_user["_id"], {}, cover_url)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
        return updated
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))


@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_story_endpoint(
    story_id: str,
    current_user: dict = Depends(get_current_user),
):
    deleted = delete_story(story_id, current_user["_id"])
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    return None


@router.post("/{story_id}/publish")
async def publish_story_endpoint(
    story_id: str,
    current_user: dict = Depends(get_current_user),
):
    published = publish_story(story_id, current_user["_id"])
    if not published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    return published
