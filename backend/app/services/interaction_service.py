from bson import ObjectId
from fastapi import HTTPException, status
from typing import List
from datetime import datetime

from ..models.interactions import Like, Bookmark, ReadingHistory, StoryVote, StoryComment, Follow
from ..database import (
    get_like_collection,
    get_bookmark_collection,
    get_reading_history_collection,
    get_story_collection,
    get_comment_collection,
    get_vote_collection,
    get_follow_collection,
)


def _id_query_values(value: str) -> list:
    values = [value]
    if ObjectId.is_valid(value):
        values.insert(0, ObjectId(value))
    return values

class InteractionService:
    def __init__(self):
        self.like_collection = get_like_collection()
        self.bookmark_collection = get_bookmark_collection()
        self.history_collection = get_reading_history_collection()
        self.story_collection = get_story_collection()
        self.comment_collection = get_comment_collection()
        self.vote_collection = get_vote_collection()
        self.follow_collection = get_follow_collection()

    async def like_story(self, user_id: str, story_id: str) -> dict:
        if not self.story_collection.find_one({"_id": ObjectId(story_id)}):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")

        existing_like = self.like_collection.find_one({
            "user_id": {"$in": _id_query_values(user_id)},
            "story_id": {"$in": _id_query_values(story_id)},
        })
        if existing_like:
            return {"message": "Story already liked"}

        like = Like(user_id=ObjectId(user_id), story_id=ObjectId(story_id))
        self.like_collection.insert_one(like.dict(by_alias=True))
        self.story_collection.update_one({"_id": ObjectId(story_id)}, {"$inc": {"likes_count": 1}})
        return {"message": "Story liked successfully"}

    async def unlike_story(self, user_id: str, story_id: str) -> dict:
        result = self.like_collection.delete_one({
            "user_id": {"$in": _id_query_values(user_id)},
            "story_id": {"$in": _id_query_values(story_id)},
        })
        if result.deleted_count == 1:
            self.story_collection.update_one({"_id": ObjectId(story_id)}, {"$inc": {"likes_count": -1}})
            return {"message": "Story unliked successfully"}
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Like not found")

    async def get_user_likes(self, user_id: str) -> List[Like]:
        likes = list(self.like_collection.find({"user_id": {"$in": _id_query_values(user_id)}}).limit(100))
        return [Like(**like) for like in likes]

    async def bookmark_chapter(self, user_id: str, story_id: str, chapter_id: str) -> dict:
        bookmark = Bookmark(user_id=ObjectId(user_id), story_id=ObjectId(story_id), chapter_id=ObjectId(chapter_id))
        self.bookmark_collection.replace_one(
            {"user_id": {"$in": _id_query_values(user_id)}, "story_id": {"$in": _id_query_values(story_id)}},
            bookmark.dict(by_alias=True),
            upsert=True
        )
        return {"message": "Bookmark updated successfully"}

    async def remove_bookmark(self, user_id: str, story_id: str) -> dict:
        result = self.bookmark_collection.delete_one({
            "user_id": {"$in": _id_query_values(user_id)},
            "story_id": {"$in": _id_query_values(story_id)},
        })
        if result.deleted_count == 1:
            return {"message": "Bookmark removed successfully"}
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found")

    async def get_user_bookmarks(self, user_id: str) -> List[Bookmark]:
        bookmarks = list(self.bookmark_collection.find({"user_id": {"$in": _id_query_values(user_id)}}).limit(100))
        return [Bookmark(**bookmark) for bookmark in bookmarks]

    async def update_reading_history(self, user_id: str, story_id: str, chapter_id: str) -> dict:
        history_entry = ReadingHistory(
            user_id=ObjectId(user_id),
            story_id=ObjectId(story_id),
            chapter_id=ObjectId(chapter_id),
            last_read_at=datetime.utcnow()
        )
        self.history_collection.replace_one(
            {"user_id": {"$in": _id_query_values(user_id)}, "story_id": {"$in": _id_query_values(story_id)}},
            history_entry.dict(by_alias=True),
            upsert=True
        )
        return {"message": "Reading history updated"}

    async def get_reading_history(self, user_id: str) -> List[ReadingHistory]:
        history = list(self.history_collection.find({"user_id": {"$in": _id_query_values(user_id)}}).sort("last_read_at", -1).limit(100))
        return [ReadingHistory(**entry) for entry in history]

    async def get_story_read_count(self, story_id: str) -> dict:
        count = self.history_collection.count_documents({"story_id": {"$in": _id_query_values(story_id)}})
        return {"story_id": story_id, "reads_count": count}

    async def vote_story(self, user_id: str, story_id: str) -> dict:
        if not self.story_collection.find_one({"_id": ObjectId(story_id)}):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")

        vote = StoryVote(user_id=ObjectId(user_id), story_id=ObjectId(story_id))
        self.vote_collection.update_one(
            {"user_id": {"$in": _id_query_values(user_id)}, "story_id": {"$in": _id_query_values(story_id)}},
            {"$set": vote.dict(by_alias=True)},
            upsert=True,
        )
        return {"message": "Story voted successfully"}

    async def get_story_votes(self, story_id: str) -> dict:
        count = self.vote_collection.count_documents({"story_id": {"$in": _id_query_values(story_id)}})
        return {"story_id": story_id, "votes_count": count}

    async def add_story_comment(self, user_id: str, story_id: str, content: str) -> dict:
        if not self.story_collection.find_one({"_id": ObjectId(story_id)}):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
        comment = StoryComment(user_id=ObjectId(user_id), story_id=ObjectId(story_id), content=content.strip())
        self.comment_collection.insert_one(comment.dict(by_alias=True))
        return {"message": "Comment added successfully"}

    async def list_story_comments(self, story_id: str) -> list[dict]:
        comments = list(self.comment_collection.find({"story_id": {"$in": _id_query_values(story_id)}}).sort("created_at", -1).limit(100))
        results = []
        for comment in comments:
            user = self.story_collection.database.users.find_one({"_id": comment["user_id"]}, {"username": 1})
            results.append({
                "_id": str(comment["_id"]),
                "story_id": str(comment["story_id"]),
                "user_id": str(comment["user_id"]),
                "username": user.get("username", "Unknown") if user else "Unknown",
                "content": comment.get("content", ""),
                "created_at": comment.get("created_at"),
            })
        return results

    async def follow_user(self, follower_id: str, following_id: str) -> dict:
        if follower_id == following_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot follow yourself")
        follow = Follow(follower_id=ObjectId(follower_id), following_id=ObjectId(following_id))
        self.follow_collection.update_one(
            {"follower_id": {"$in": _id_query_values(follower_id)}, "following_id": {"$in": _id_query_values(following_id)}},
            {"$set": follow.dict(by_alias=True)},
            upsert=True,
        )
        return {"message": "Followed successfully"}

    async def unfollow_user(self, follower_id: str, following_id: str) -> dict:
        result = self.follow_collection.delete_one({
            "follower_id": {"$in": _id_query_values(follower_id)},
            "following_id": {"$in": _id_query_values(following_id)},
        })
        if result.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Follow not found")
        return {"message": "Unfollowed successfully"}

    async def get_following(self, user_id: str) -> list[dict]:
        follows = list(self.follow_collection.find({"follower_id": {"$in": _id_query_values(user_id)}}).limit(200))
        return [{"following_id": str(item["following_id"]), "created_at": item.get("created_at")} for item in follows]

def get_interaction_service() -> InteractionService:
    return InteractionService()
