from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from ..utils.pyobjectid import PyObjectId



class StoryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    genre: str = Field(..., min_length=1, max_length=100)
    tags: list[str] = Field(default_factory=list)
    status: str = Field(default="draft", pattern="^(draft|published)$")


class StoryUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=5000)
    genre: Optional[str] = Field(default=None, min_length=1, max_length=100)
    tags: Optional[list[str]] = None
    status: Optional[str] = Field(default=None, pattern="^(draft|published)$")


class StoryResponse(BaseModel):
    _id: PyObjectId
    user_id: PyObjectId
    title: str
    description: str
    genre: str
    tags: list[str]
    status: str
    cover_image_url: str
    chapter_count: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
