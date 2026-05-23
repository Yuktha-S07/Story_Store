"""
Beautify stories and chapters in the database: replace placeholder titles and lorem
with nicer story-like titles, descriptions, and chapter content.

Run with:
    python -m runpy -c "runpy.run_path('backend/scripts/beautify_stories.py')"
Or simply:
    python backend/scripts/beautify_stories.py

This script will update all stories in the `story_store` database.
"""
from datetime import datetime
import random
from pymongo import MongoClient
from bson import ObjectId

MONGO = "mongodb://localhost:27017"
DB_NAME = "story_store"

SAMPLE_TITLES = [
    "The Lantern of Hollow Hill",
    "When Stars Remember",
    "A Cartographer's Promise",
    "The Last Letter from Autumn",
    "Beneath the Glass Orchard",
    "Waves of Quiet Fury",
    "The Clockmaker's Daughter",
    "Songs of the Empty Harbor",
    "The Mapmaker and the Moon",
    "Where Rivers Sleep",
    "The Book of Small Houses",
    "A Thread Between Two Cities",
]

SAMPLE_DESCRIPTIONS = [
    "A tender tale of loss and discovery as one traveler learns what it means to come home.",
    "A lyrical story about secrets passed down through generations and the maps that keep them.",
    "An intimate portrait of a village whose lives are changed by a mysterious visitor.",
    "A melancholic adventure across the sea, where memories wash ashore like driftwood.",
    "A cozy mystery with a dash of magic and a stubborn heroine who refuses to look away.",
]

SAMPLE_PARAGRAPHS = [
    "The morning fog sat low over the fields, and the lanterns in the windows hummed with the memories of another season.",
    "He had a way of folding silence into his pockets, and when he opened them the town would find new stories tucked inside.",
    "They said the harbor kept its own time, and that the tides remembered names in a voice like stone.",
    "Every map she drew had a small, secret place where someone had once hidden a hope.",
    "The letter smelled faintly of smoke and lemon; it was the kind of handwriting that made you forgive the past.",
    "She walked through the orchard as if she were reading a book the branches had written overnight.",
    "At dusk, the clocktower sang a song only the lonely could understand, and the town answered in whispers.",
    "He collected lost things, not to keep, but to give back when the world stopped listening.",
]

random.seed(42)


def make_paragraph(n=3):
    return "\n\n".join(random.choice(SAMPLE_PARAGRAPHS) for _ in range(n))


def main():
    client = MongoClient(MONGO)
    db = client[DB_NAME]

    stories = list(db.stories.find())
    if not stories:
        print('No stories found in DB')
        return

    used_titles = set()
    title_pool = SAMPLE_TITLES.copy()
    random.shuffle(title_pool)

    for idx, s in enumerate(stories, start=1):
        if title_pool:
            new_title = title_pool.pop(0)
        else:
            new_title = f"Tale {idx}"
        # Ensure uniqueness
        if new_title in used_titles:
            new_title = f"{new_title} ({idx})"
        used_titles.add(new_title)

        new_description = random.choice(SAMPLE_DESCRIPTIONS)

        # Update story document
        db.stories.update_one(
            {"_id": s["_id"]},
            {
                "$set": {
                    "title": new_title,
                    "description": new_description,
                    "updated_at": datetime.utcnow(),
                }
            },
        )

        # Fetch chapters
        chapters = list(db.chapters.find({"story_id": s["_id"]}).sort("chapter_number", 1))

        if not chapters:
            # Insert 2 chapters
            for cnum in range(1, 3):
                chap = {
                    "story_id": s["_id"],
                    "user_id": s.get("user_id"),
                    "title": f"Chapter {cnum}",
                    "content": make_paragraph(4),
                    "chapter_number": cnum,
                    "status": "published",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }
                db.chapters.insert_one(chap)
            db.stories.update_one({"_id": s["_id"]}, {"$set": {"chapter_count": 2}})
            print(f"Added 2 chapters to '{new_title}'")
        else:
            for c in chapters:
                cnum = c.get("chapter_number", 1)
                new_ch_title = f"Chapter {cnum}: {random.choice(['Awakening', 'The Crossing', 'A Quiet Thing', 'The Return'])}"
                new_content = make_paragraph(4)
                db.chapters.update_one(
                    {"_id": c["_id"]},
                    {
                        "$set": {
                            "title": new_ch_title,
                            "content": new_content,
                            "updated_at": datetime.utcnow(),
                        }
                    },
                )
            db.stories.update_one({"_id": s["_id"]}, {"$set": {"chapter_count": len(chapters)}})
            print(f"Updated {len(chapters)} chapters for '{new_title}'")

    print("✓ Beautified stories and chapters")


if __name__ == '__main__':
    main()
