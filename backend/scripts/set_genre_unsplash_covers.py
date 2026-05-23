"""
Set story cover_image_url to genre-based Unsplash source URLs.
This uses https://source.unsplash.com/ which serves a photo matching the query.
Run:
  & venv\Scripts\python.exe backend/scripts/set_genre_unsplash_covers.py
"""
from pymongo import MongoClient
from datetime import datetime

MONGO = "mongodb://localhost:27017"
DB_NAME = "story_store"

GENRE_MAP = {
    'Fantasy': 'fantasy,illustration,landscape',
    'Romance': 'romance,couple,romantic',
    'Werewolf': 'forest,moon,werewolf',
    'Comic': 'comic,illustration,graphic',
    'Novels': 'novel,book,library',
    'New Adult': 'young%20adult,portrait,city',
    'Short Story': 'short%20story,book,writing',
    'Fanfiction': 'fans,fanfiction,books',
    'Mystery': 'mystery,detective,moody',
    'Sci-Fi': 'science%20fiction,space,technology',
    'Historical': 'historical,period,painting',
}

client = MongoClient(MONGO)
db = client[DB_NAME]

stories = list(db.stories.find().sort('created_at', 1))
if not stories:
    print('No stories found')
    exit(0)

for s in stories:
    genre = s.get('genre') or ''
    query = GENRE_MAP.get(genre, None)
    if not query:
        # fallback: try lowercased genre words, else use 'books'
        query = ','.join(genre.lower().split()) if genre else 'books'
    # Unsplash source: featured by query, size 1200x1800
    url = f"https://source.unsplash.com/1200x1800/?{query}"
    db.stories.update_one({'_id': s['_id']}, {'$set': {'cover_image_url': url, 'updated_at': datetime.utcnow()}})
    print(f"Updated {s['_id']} genre='{genre or 'none'}' -> {url}")

print('✓ Done setting Unsplash genre covers')
