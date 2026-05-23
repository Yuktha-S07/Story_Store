from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from bson import ObjectId

from ..database import get_story_collection



class RecommendationService:
    def __init__(self):
        self.story_collection = get_story_collection()

    async def _build_corpus(self, filter_published: bool = True):
        query = {}
        if filter_published:
            query["status"] = "published"
        docs = list(self.story_collection.find(query))
        corpus = []
        ids = []
        for doc in docs:
            genre = doc.get("genre", "") or ""
            tags = " ".join(doc.get("tags", []) or [])
            text = f"{genre} {tags}".strip()
            corpus.append(text)
            ids.append(str(doc.get("_id")))
        return ids, corpus

    async def recommend_similar(self, story_id: str, limit: int = 5) -> List[Dict]:
        ids, corpus = await self._build_corpus()
        if not corpus:
            return []
        vectorizer = TfidfVectorizer()
        tfidf = vectorizer.fit_transform(corpus)
        try:
            target_index = ids.index(story_id)
        except ValueError:
            return []
        scores = cosine_similarity(tfidf[target_index], tfidf).flatten()
        scored = [(i, float(score)) for i, score in enumerate(scores) if i != target_index]
        scored.sort(key=lambda x: x[1], reverse=True)
        top = scored[:limit]
        results = []
        for idx, score in top:
            sid = ids[idx]
            doc = self.story_collection.find_one({"_id": ObjectId(sid)})
            if not doc:
                continue
            results.append({
                "_id": str(doc.get("_id")),
                "title": doc.get("title"),
                "description": doc.get("description"),
                "score": score,
            })
        return results

    async def get_popular_stories(self, limit: int = 5) -> List[Dict]:
        docs = list(self.story_collection.find({"status": "published"}).sort("view_count", -1).limit(limit))
        return [
            {
                "_id": str(doc.get("_id")),
                "title": doc.get("title"),
                "description": doc.get("description"),
                "score": None,
            }
            for doc in docs
        ]

    async def get_user_recommendations(self, user_id: str, limit: int = 5) -> List[Dict]:
        # Recommend based on stories the user has liked or read
        # For simplicity, recommend similar to the most recently read or liked story
        from ..database import get_reading_history_collection, get_like_collection
        history_collection = get_reading_history_collection()
        like_collection = get_like_collection()
        # Try reading history first
        history = list(history_collection.find({"user_id": ObjectId(user_id)}).sort("last_read_at", -1).limit(1))
        if history:
            story_id = str(history[0]["story_id"])
            return await self.recommend_similar(story_id, limit)
        # Try likes
        likes = list(like_collection.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).limit(1))
        if likes:
            story_id = str(likes[0]["story_id"])
            return await self.recommend_similar(story_id, limit)
        # Fallback: popular
        return await self.get_popular_stories(limit)


def get_recommendation_service() -> RecommendationService:
    return RecommendationService()
