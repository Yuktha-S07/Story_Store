"""
Ensure each story has a unique title, a human-like author name, and a distinct SVG cover.
Run with venv python:

    & venv\Scripts\python.exe backend/scripts/ensure_unique_titles_authors.py
"""
from datetime import datetime
import random
from urllib.parse import quote
from pymongo import MongoClient
from bson import ObjectId

MONGO = "mongodb://localhost:27017"
DB_NAME = "story_store"

TITLE_POOL = [
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
    "A Garden for Winter",
    "The Boy Who Collected Maps",
    "Notes from the Blue Station",
    "The Portrait of Quiet Things",
    "Letters to the Sea",
]

AUTHOR_FIRST = ["Lena","Oliver","Maya","Jonah","Clara","Ethan","Iris","Dante","Sofia","Marcus","Adele","Nora","Felix","Gideon","June","Caleb","Rosa","Adrian","Mira","Theo"]
AUTHOR_LAST = ["Corwin","Rivers","Hale","Morrow","Bennett","Caldwell","Frost","Archer","Vale","Sinclair","Locke","Voss","Marin","Quill","Hart","Sable","Garnet","Wells","Parker","Rowe"]

COLORS = ["#FDE68A", "#FECACA", "#C7F9CC", "#CFFAFE", "#E9D5FF", "#FBCFE8", "#E6E6FA", "#F0F9FF", "#FEF3C7", "#FEEBC8"]

SVG_TEMPLATE = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900">'
    '<rect width="100%" height="100%" fill="{bg}"/>'
    '<g transform="translate(40,120)">'
    '<text x="0" y="0" font-family="serif" font-size="36" fill="{fg}" >{title}</text>'
    '<text x="0" y="60" font-family="sans-serif" font-size="16" fill="{fg}" >{subtitle}</text>'
    '</g>'
    '<g fill="{fg}" opacity="0.12">{shapes}</g>'
    '</svg>'
)

SHAPES = [
    '<circle cx="420" cy="180" r="140"/>',
    '<rect x="380" y="320" width="160" height="260" rx="20"/>',
    '<ellipse cx="450" cy="600" rx="120" ry="200"/>',
    '<polygon points="300,700 340,620 380,700 360,680"/>',
    '<path d="M100 500 C 150 400, 250 400, 300 500"/>',
]

random.seed(7)


def make_data_url(title, subtitle, bg, fg="#111111", shape_idx=0):
    shapes = SHAPES[shape_idx % len(SHAPES)]
    svg = SVG_TEMPLATE.format(bg=bg, fg=fg, title=title.replace('&','&amp;'), subtitle=subtitle.replace('&','&amp;'), shapes=shapes)
    return "data:image/svg+xml;utf8," + quote(svg)


def random_author(i):
    return f"{random.choice(AUTHOR_FIRST)} {random.choice(AUTHOR_LAST)}"


def main():
    client = MongoClient(MONGO)
    db = client[DB_NAME]

    stories = list(db.stories.find().sort('created_at', 1))
    if not stories:
        print('No stories found')
        return

    used_titles = set([s.get('title','') for s in stories])
    pool = TITLE_POOL.copy()
    random.shuffle(pool)

    for idx, s in enumerate(stories):
        current_title = s.get('title','')
        # choose a unique title
        new_title = None
        while pool:
            candidate = pool.pop(0)
            if candidate not in used_titles:
                new_title = candidate
                used_titles.add(candidate)
                break
        if new_title is None:
            new_title = f"Tale of Quiet {idx+1}"
            used_titles.add(new_title)

        # create unique author
        author_name = random_author(idx)
        username = '_'.join(author_name.lower().split())
        email = f"{username}{idx+1}@example.com"
        now = datetime.utcnow()
        user_doc = {
            'email': email,
            'username': username,
            'hashed_password': 'seed-password',
            'bio': 'Seeded author',
            'avatar_url': '',
            'is_active': True,
            'is_verified': True,
            'created_at': now,
            'updated_at': now,
        }
        res = db.users.insert_one(user_doc)
        new_user_id = res.inserted_id

        # update chapters to new user
        db.chapters.update_many({'story_id': s['_id']}, {'$set': {'user_id': new_user_id}})

        # make cover
        bg = COLORS[idx % len(COLORS)]
        subtitle = s.get('description','')[:60] or 'A short tale'
        data_url = make_data_url(new_title, subtitle, bg, shape_idx=idx)

        db.stories.update_one({'_id': s['_id']}, {'$set': {'title': new_title, 'user_id': new_user_id, 'cover_image_url': data_url, 'updated_at': now}})
        print(f"Updated story id={s['_id']} -> title='{new_title}', author='{author_name}'")

    print('✓ Ensured unique titles, authors, and covers')


if __name__ == '__main__':
    main()
