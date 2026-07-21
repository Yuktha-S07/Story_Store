from pymongo import MongoClient
from datetime import datetime

MONGO = "mongodb://localhost:27017"
DB_NAME = "story_store"

client = MongoClient(MONGO)
db = client[DB_NAME]

TOTAL_COVERS = 25

stories = list(db.stories.find({"$or": [
    {"cover_image_url": {"$exists": False}},
    {"cover_image_url": ""},
    {"cover_image_url": None},
]}).sort('created_at', 1))

if not stories:
    print('All stories already have covers assigned')
    exit(0)

for i, s in enumerate(stories, start=1):
    cover_path = f"/uploads/cover_{((i-1) % TOTAL_COVERS) + 1}.svg"
    db.stories.update_one(
        {'_id': s['_id']},
        {'$set': {'cover_image_url': cover_path, 'updated_at': datetime.utcnow()}}
    )
    print(f"Updated story {s['_id']} -> {cover_path}")

print(f'\nDone — assigned covers to {len(stories)} stories')
