from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from ..utils.pyobjectid import PyObjectId


class Message(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    sender_id: PyObjectId = Field(...)
    recipient_id: PyObjectId = Field(...)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}


class SendMessageRequest(BaseModel):
    recipient_id: str
    content: str
