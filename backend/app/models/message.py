from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from ..utils.pyobjectid import PyObjectId


class MessageReaction(BaseModel):
    user_id: PyObjectId = Field(...)
    emoji: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Message(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    sender_id: PyObjectId = Field(...)
    recipient_id: PyObjectId = Field(...)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    iv: Optional[str] = None
    is_encrypted: bool = False
    reactions: List[MessageReaction] = Field(default_factory=list)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}


class SendMessageRequest(BaseModel):
    recipient_id: str
    content: str
