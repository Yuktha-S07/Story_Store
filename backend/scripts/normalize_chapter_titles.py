"""
Normalize chapter titles so each story's chapters are titled "Chapter 1", "Chapter 2", ...
Run with the backend venv python from repo root:

    & venv\Scripts\python.exe backend/scripts/normalize_chapter_titles.py
"""
from pymongo import MongoClient
from bson import ObjectId

MONGO = "mongodb://localhost:27017"
DB_NAME = "story_store"

client = MongoClient(MONGO)
db = client[DB_NAME]

# find all story ids
stories = list(db.stories.find({}, {'_id': 1}).sort('created_at', 1))
if not stories:
    print('No stories found')
    exit(0)

for s in stories:
    sid = s['_id']
    # fetch chapters for this story, prefer created_at ordering, fallback to _id
    chapters = list(db.chapters.find({'story_id': sid}).sort('created_at', 1))
    if not chapters:
        continue
    for i, ch in enumerate(chapters, start=1):
        new_title = f"Chapter {i}"
        db.chapters.update_one({'_id': ch['_id']}, {'$set': {'title': new_title}})
    print(f"Normalized {len(chapters)} chapters for story {sid}")

print('✓ Done normalizing chapter titles')
