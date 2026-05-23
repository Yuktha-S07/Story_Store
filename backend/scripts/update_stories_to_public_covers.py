"""
Update stories in MongoDB to use public SVG covers at /uploads/cover_<n>.svg
Run with:
  & venv\Scripts\python.exe backend/scripts/update_stories_to_public_covers.py
"""
from pymongo import MongoClient
from datetime import datetime

MONGO = "mongodb://localhost:27017"
DB_NAME = "story_store"

client = MongoClient(MONGO)
db = client[DB_NAME]

stories = list(db.stories.find().sort('created_at', 1))
if not stories:
    print('No stories found')
    exit(0)

for i, s in enumerate(stories, start=1):
    cover_path = f"/uploads/cover_{((i-1)%12)+1}.svg"
    db.stories.update_one({'_id': s['_id']}, {'$set': {'cover_image_url': cover_path, 'updated_at': datetime.utcnow()}})
    print(f"Updated story {s['_id']} -> {cover_path}")

print('✓ Done updating story covers')
