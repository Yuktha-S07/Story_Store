from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ..services.recommendation_service import RecommendationService, get_recommendation_service
from ..middleware.auth_middleware import get_current_user_optional

router = APIRouter()


@router.get("/stories/{story_id}/recommendations")
async def get_story_recommendations(
    story_id: str,
    limit: int = 5,
    recommendation_service: RecommendationService = Depends(get_recommendation_service)
):
    """Get similar stories based on genre and tags."""
    if limit < 1 or limit > 20:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="limit must be between 1 and 20")
    
    recommendations = await recommendation_service.recommend_similar(story_id, limit)
    return {
        "story_id": story_id,
        "recommendations": recommendations
    }


@router.get("/recommendations/personalized")
async def get_personalized_recommendations(
    limit: int = 5,
    current_user: dict | None = Depends(get_current_user_optional),
    recommendation_service: RecommendationService = Depends(get_recommendation_service)
):
    """Get personalized recommendations based on user's reading history and likes."""
    if limit < 1 or limit > 20:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="limit must be between 1 and 20")
    
    if not current_user:
        # Return random popular stories if user is not authenticated
        recommendations = await recommendation_service.get_popular_stories(limit)
        return {
            "recommendations": recommendations,
            "type": "popular"
        }
    
    # Get recommendations based on user's reading history
        recommendations = await recommendation_service.get_user_recommendations(str(current_user["_id"]), limit)
    return {
        "recommendations": recommendations,
        "type": "personalized"
    }
