"""
Simple seeder that connects directly to MongoDB and inserts sample stories and chapters.
Run with:

    python backend/scripts/seed_more_simple.py

This script does not depend on the `app` package and will insert documents into the
`story_store` database at mongodb://localhost:27017.
"""
from datetime import datetime
import random
from pymongo import MongoClient

MONGO = "mongodb://localhost:27017"
DB_NAME = "story_store"

LOREM = (
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
    "Pellentesque vitae velit ex. Mauris dapibus risus quis suscipit vulputate."
)
GENRES = ["Fantasy", "Sci-Fi", "Romance", "Mystery", "Horror", "Adventure", "Slice of Life"]


def main(total_stories=10):
    client = MongoClient(MONGO)
    db = client[DB_NAME]

    now = datetime.utcnow()
    inserted = 0
    for i in range(total_stories):
        title = f"Extra Seed Story {i+1} - {random.randint(1000,9999)}"
        author = {
            "_id": f"seed_author_extra_{i+1}",
            "username": f"seed_extra_{i+1}",
        }
        story_doc = {
            "user_id": str(author["_id"]),
            "title": title,
            "description": f"Automatically inserted story {i+1}",
            "genre": random.choice(GENRES),
            "tags": ["seed", "extra"],
            "status": "published",
            "cover_image_url": "",
            "chapter_count": 0,
            "created_at": now,
            "updated_at": now,
        }
        res = db.stories.insert_one(story_doc)
        story_id = res.inserted_id

        num_chapters = random.randint(2, 4)
        for c in range(1, num_chapters + 1):
            chap_doc = {
                "story_id": story_id,
                "user_id": str(author["_id"]),
                "title": f"Chapter {c}",
                "content": LOREM + "\n\n" + f"(Sample content {c})",
                "chapter_number": c,
                "status": "published",
                "created_at": now,
                "updated_at": now,
            }
            db.chapters.insert_one(chap_doc)

        db.stories.update_one({"_id": story_id}, {"$set": {"chapter_count": num_chapters}})
        inserted += 1
        print(f"Inserted extra story {i+1} with {num_chapters} chapters")

    print(f"✓ Inserted {inserted} extra stories")


if __name__ == '__main__':
    main(10)
