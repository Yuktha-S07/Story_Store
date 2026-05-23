"""
Assign a unique author, unique title, and an SVG data-URL cover image to each story.
Run with the project's venv python:

    & venv\Scripts\python.exe backend/scripts/assign_unique_authors_and_covers.py

This script creates a new user per story and updates `stories.user_id`, `chapters.user_id`,
`stories.title`, `stories.description`, and `stories.cover_image_url`.
"""
from datetime import datetime
import random
from urllib.parse import quote
from pymongo import MongoClient
from bson import ObjectId

MONGO = "mongodb://localhost:27017"
DB_NAME = "story_store"

TITLES = [
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
    "The River Makes A Promise",
    "The House Under the Cypress",
    "The Glass Key",
]

DESCRIPTIONS = [
    "A short evocative tale about memory, maps and small kindnesses.",
    "A story of found things, quiet towns, and second chances.",
    "An intimate, gentle adventure across the margins of a familiar world.",
    "A wistful exploration of what people keep and what they let go.",
]

COLORS = [
    "#FDE68A", "#FECACA", "#C7F9CC", "#CFFAFE", "#E9D5FF", "#FBCFE8", "#E6E6FA",
    "#F0F9FF", "#FEF3C7", "#FEEBC8", "#D1FAE5", "#FCE7F3",
]

random.seed(1234)

SVG_TEMPLATE = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900">'
    '<rect width="100%" height="100%" fill="{bg}"/>'
    '<g transform="translate(40,120)">'
    '<text x="0" y="0" font-family="serif" font-size="36" fill="{fg}" >{title}</text>'
    '<text x="0" y="60" font-family="sans-serif" font-size="16" fill="{fg}" >{subtitle}</text>'
    '</g>'
    '</svg>'
)


def make_data_url(title, subtitle, bg, fg="#111111"):
    svg = SVG_TEMPLATE.format(bg=bg, fg=fg, title=title.replace('&','&amp;'), subtitle=subtitle.replace('&','&amp;'))
    return "data:image/svg+xml;utf8," + quote(svg)


def main():
    client = MongoClient(MONGO)
    db = client[DB_NAME]

    stories = list(db.stories.find().sort("created_at", 1))
    if not stories:
        print("No stories found")
        return

    random.shuffle(TITLES)

    for i, s in enumerate(stories):
        title = TITLES[i % len(TITLES)]
        # ensure uniqueness
        if db.stories.count_documents({"title": title}) > 0:
            title = f"{title} ({i+1})"

        desc = random.choice(DESCRIPTIONS)

        # create a new user for this story
        now = datetime.utcnow()
        username = f"seed_writer_{i+1}"
        email = f"{username}@example.com"
        user_doc = {
            "email": email,
            "username": username,
            "hashed_password": "seed-password",
            "bio": "Seeded author",
            "avatar_url": "",
            "is_active": True,
            "is_verified": True,
            "created_at": now,
            "updated_at": now,
        }
        res = db.users.insert_one(user_doc)
        new_user_id = res.inserted_id

        # assign chapters to new user as well
        db.chapters.update_many({"story_id": s["_id"]}, {"$set": {"user_id": new_user_id}})

        # make SVG cover
        bg = COLORS[i % len(COLORS)]
        subtitle = desc[:60]
        data_url = make_data_url(title, subtitle, bg)

        db.stories.update_one(
            {"_id": s["_id"]},
            {
                "$set": {
                    "title": title,
                    "description": desc,
                    "user_id": new_user_id,
                    "cover_image_url": data_url,
                    "updated_at": now,
                }
            },
        )
        print(f"Updated story {_short(s.get('title'))} -> '{title}' by {username}")

    print("✓ Assigned unique authors, titles and covers")


def _short(t):
    if not t:
        return "<no title>"
    return (t[:30] + "...") if len(t) > 30 else t


if __name__ == '__main__':
    main()
