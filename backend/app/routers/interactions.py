from fastapi import APIRouter, Body, Depends, HTTPException, status
from typing import List

from ..services.interaction_service import InteractionService, get_interaction_service
from ..middleware.auth_middleware import get_current_user
from ..models.interactions import Like, Bookmark, ReadingHistory

router = APIRouter()

@router.post("/stories/{story_id}/like", status_code=status.HTTP_200_OK)
async def like_story(
    story_id: str,
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service)
):
    return await interaction_service.like_story(current_user["_id"], story_id)

@router.delete("/stories/{story_id}/like", status_code=status.HTTP_200_OK)
async def unlike_story(
    story_id: str,
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service)
):
    return await interaction_service.unlike_story(current_user["_id"], story_id)

@router.get("/likes", response_model=List[Like])
async def get_user_likes(
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service)
):
    return await interaction_service.get_user_likes(current_user["_id"])

@router.post("/stories/{story_id}/chapters/{chapter_id}/bookmark", status_code=status.HTTP_200_OK)
async def bookmark_chapter(
    story_id: str,
    chapter_id: str,
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service)
):
    return await interaction_service.bookmark_chapter(current_user["_id"], story_id, chapter_id)

@router.delete("/stories/{story_id}/bookmark", status_code=status.HTTP_200_OK)
async def remove_bookmark(
    story_id: str,
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service)
):
    return await interaction_service.remove_bookmark(current_user["_id"], story_id)

@router.get("/bookmarks", response_model=List[Bookmark])
async def get_user_bookmarks(
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service)
):
    return await interaction_service.get_user_bookmarks(current_user["_id"])

@router.post("/stories/{story_id}/chapters/{chapter_id}/history", status_code=status.HTTP_200_OK)
async def update_reading_history(
    story_id: str,
    chapter_id: str,
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service)
):
    return await interaction_service.update_reading_history(current_user["_id"], story_id, chapter_id)

@router.get("/history", response_model=List[ReadingHistory])
async def get_reading_history(
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service)
):
    return await interaction_service.get_reading_history(current_user["_id"])


@router.post("/stories/{story_id}/vote", status_code=status.HTTP_200_OK)
async def vote_story(
    story_id: str,
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service),
):
    return await interaction_service.vote_story(current_user["_id"], story_id)


@router.get("/stories/{story_id}/votes")
async def get_story_votes(
    story_id: str,
    interaction_service: InteractionService = Depends(get_interaction_service),
):
    return await interaction_service.get_story_votes(story_id)


@router.get("/stories/{story_id}/reads")
async def get_story_reads(
    story_id: str,
    interaction_service: InteractionService = Depends(get_interaction_service),
):
    return await interaction_service.get_story_read_count(story_id)


@router.get("/stories/{story_id}/comments")
async def get_story_comments(
    story_id: str,
    interaction_service: InteractionService = Depends(get_interaction_service),
):
    return await interaction_service.list_story_comments(story_id)


@router.post("/stories/{story_id}/comments", status_code=status.HTTP_201_CREATED)
async def add_story_comment(
    story_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service),
):
    content = (payload.get("content") or "").strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Comment content is required")
    return await interaction_service.add_story_comment(current_user["_id"], story_id, content)


@router.post("/users/{user_id}/follow", status_code=status.HTTP_200_OK)
async def follow_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service),
):
    return await interaction_service.follow_user(current_user["_id"], user_id)


@router.delete("/users/{user_id}/follow", status_code=status.HTTP_200_OK)
async def unfollow_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service),
):
    return await interaction_service.unfollow_user(current_user["_id"], user_id)


@router.get("/following")
async def get_following(
    current_user: dict = Depends(get_current_user),
    interaction_service: InteractionService = Depends(get_interaction_service),
):
    return await interaction_service.get_following(current_user["_id"])
