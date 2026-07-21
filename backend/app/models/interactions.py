from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from ..utils.pyobjectid import PyObjectId

class Like(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(...)
    story_id: PyObjectId = Field(...)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
        json_schema_extra = {
            "example": {
                "user_id": "60d5ec49e7ef8f0015d5f8b1",
                "story_id": "60d5ec49e7ef8f0015d5f8b2",
            }
        }

class Bookmark(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(...)
    story_id: PyObjectId = Field(...)
    chapter_id: PyObjectId = Field(...)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
        json_schema_extra = {
            "example": {
                "user_id": "60d5ec49e7ef8f0015d5f8b1",
                "story_id": "60d5ec49e7ef8f0015d5f8b2",
                "chapter_id": "60d5ec49e7ef8f0015d5f8b3",
            }
        }

class ReadingHistory(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(...)
    story_id: PyObjectId = Field(...)
    chapter_id: PyObjectId = Field(...)
    last_read_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
        json_schema_extra = {
            "example": {
                "user_id": "60d5ec49e7ef8f0015d5f8b1",
                "story_id": "60d5ec49e7ef8f0015d5f8b2",
                "chapter_id": "60d5ec49e7ef8f0015d5f8b3",
            }
        }


class StoryVote(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(...)
    story_id: PyObjectId = Field(...)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}


class StoryComment(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(...)
    story_id: PyObjectId = Field(...)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}


class Follow(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    follower_id: PyObjectId = Field(...)
    following_id: PyObjectId = Field(...)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}
