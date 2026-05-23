from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from ..utils.pyobjectid import PyObjectId



class ChapterCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    chapter_number: Optional[int] = Field(default=None, ge=1)
    status: str = Field(default="draft", pattern="^(draft|published)$")


class ChapterUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    content: Optional[str] = Field(default=None, min_length=1)
    chapter_number: Optional[int] = Field(default=None, ge=1)
    status: Optional[str] = Field(default=None, pattern="^(draft|published)$")


class ChapterResponse(BaseModel):
    _id: PyObjectId
    story_id: PyObjectId
    user_id: PyObjectId
    title: str
    content: str
    chapter_number: int
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
