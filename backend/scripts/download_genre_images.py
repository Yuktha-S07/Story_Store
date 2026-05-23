"""
Download a genre-based photo for each story from Unsplash and save locally.
Updates `stories.cover_image_url` to point to the downloaded file in frontend/public/uploads.

Run:
  & venv\Scripts\python.exe backend/scripts/download_genre_images.py
"""
import os
import time
import math
from urllib.parse import quote
from pymongo import MongoClient
from datetime import datetime
import requests

MONGO = "mongodb://localhost:27017"
DB_NAME = "story_store"
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'frontend', 'public', 'uploads')
os.makedirs(OUT_DIR, exist_ok=True)

GENRE_MAP = {
    'Fantasy': 'fantasy landscape',
    'Romance': 'romance couple',
    'Werewolf': 'forest moon',
    'Comic': 'comic illustration',
    'Novels': 'book library',
    'New Adult': 'young adult portrait',
    'Short Story': 'short story book',
    'Fanfiction': 'fanfiction fandom',
    'Mystery': 'mystery detective moody',
    'Sci-Fi': 'science fiction space',
    'Historical': 'historical period painting',
    'Adventure': 'adventure landscape',
    'Slice of Life': 'slice of life portrait',
    'Horror': 'horror dark',
}

client = MongoClient(MONGO)
db = client[DB_NAME]
stories = list(db.stories.find().sort('created_at', 1))
if not stories:
    print('No stories found')
    exit(0)

session = requests.Session()
# Use a browser-like user agent and accept header to reduce 403/503 from image hosts
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Referer': 'https://unsplash.com/'
})

# Helper: placeimg categories for fallback
PLACEIMG_CAT = {
    'Fantasy': 'nature',
    'Romance': 'people',
    'Werewolf': 'nature',
    'Comic': 'tech',
    'Novels': 'arch',
    'New Adult': 'people',
    'Short Story': 'arch',
    'Fanfiction': 'people',
    'Mystery': 'arch',
    'Sci-Fi': 'tech',
    'Historical': 'arch',
    'Adventure': 'nature',
    'Slice of Life': 'people',
    'Horror': 'nature',
}

FORCE_GENRE_SVG = True

GENRE_ACCENTS = {
        'Fantasy': ('#1d4ed8', '#7c3aed', '#f472b6'),
        'Romance': ('#be123c', '#fb7185', '#fde68a'),
        'Werewolf': ('#111827', '#4b5563', '#9ca3af'),
        'Comic': ('#f59e0b', '#ef4444', '#3b82f6'),
        'Novels': ('#0f766e', '#14b8a6', '#a7f3d0'),
        'New Adult': ('#7c2d12', '#ea580c', '#fdba74'),
        'Short Story': ('#4338ca', '#818cf8', '#c7d2fe'),
        'Fanfiction': ('#0f172a', '#38bdf8', '#f472b6'),
        'Mystery': ('#0f172a', '#334155', '#f59e0b'),
        'Sci-Fi': ('#0b1020', '#2563eb', '#22d3ee'),
        'Historical': ('#7c2d12', '#d97706', '#fef3c7'),
        'Adventure': ('#14532d', '#16a34a', '#f59e0b'),
        'Slice of Life': ('#334155', '#94a3b8', '#f8fafc'),
        'Horror': ('#1f2937', '#991b1b', '#f87171'),
}

GENRE_MOTIFS = {
        'Fantasy': 'moon / stars / castle',
        'Romance': 'heart / petals / glow',
        'Werewolf': 'moon / forest / claw marks',
        'Comic': 'speech bubbles / halftone',
        'Novels': 'book / shelves / paper',
        'New Adult': 'city lights / window / dusk',
        'Short Story': 'paper / type / vignette',
        'Fanfiction': 'stars / notebook / spark',
        'Mystery': 'key / fog / lantern',
        'Sci-Fi': 'planet / orbit / grid',
        'Historical': 'arch / ink / sepia',
        'Adventure': 'mountain / compass / path',
        'Slice of Life': 'home / tea / daylight',
        'Horror': 'moon / silhouette / static',
}


def make_genre_svg(title, genre, index):
        colors = GENRE_ACCENTS.get(genre, ('#111827', '#334155', '#64748b'))
        motif = GENRE_MOTIFS.get(genre, 'abstract shapes')
        bg1, bg2, bg3 = colors
        cx = 180 + (index * 13) % 420
        cy = 170 + (index * 17) % 260
        radius = 70 + (index * 11) % 90
        orbit_x = 900 - (index * 19) % 260
        orbit_y = 130 + (index * 23) % 300
        title_short = title[:28]

        return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="{title} cover">
    <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="{bg1}"/>
            <stop offset="50%" stop-color="{bg2}"/>
            <stop offset="100%" stop-color="{bg3}"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    <rect width="1200" height="800" fill="url(#bg)"/>
    <rect width="1200" height="800" fill="url(#glow)"/>
    <circle cx="{cx}" cy="{cy}" r="{radius}" fill="#ffffff" opacity="0.14" filter="url(#blur)"/>
    <circle cx="{orbit_x}" cy="{orbit_y}" r="{int(radius * 0.55)}" fill="#ffffff" opacity="0.10" filter="url(#blur)"/>
    <path d="M0 610 C 160 560, 320 680, 480 630 S 800 560, 1200 620 L 1200 800 L 0 800 Z" fill="#0b1020" opacity="0.22"/>
    <path d="M0 690 C 200 640, 360 760, 560 714 S 860 650, 1200 700 L 1200 800 L 0 800 Z" fill="#000" opacity="0.10"/>
    <g opacity="0.28" fill="#fff">
        <circle cx="120" cy="120" r="3"/>
        <circle cx="220" cy="220" r="2"/>
        <circle cx="1040" cy="160" r="2"/>
        <circle cx="900" cy="90" r="3"/>
        <circle cx="1030" cy="540" r="2"/>
        <circle cx="180" cy="580" r="2"/>
    </g>
    <g transform="translate(88,86)">
        <rect x="0" y="0" width="360" height="114" rx="28" fill="#000" opacity="0.18"/>
        <text x="28" y="46" fill="#fff" font-size="26" font-family="Georgia, 'Times New Roman', serif" letter-spacing="3">{genre.upper()}</text>
        <text x="28" y="84" fill="#fff" font-size="18" font-family="'Segoe UI', sans-serif" opacity="0.88">{motif}</text>
    </g>
    <g transform="translate(88,620)">
        <rect x="0" y="0" width="1024" height="110" rx="26" fill="#000" opacity="0.20"/>
        <text x="34" y="48" fill="#fff" font-size="40" font-family="Georgia, 'Times New Roman', serif">{title_short}</text>
        <text x="34" y="84" fill="#fff" font-size="18" font-family="'Segoe UI', sans-serif" opacity="0.90">Aesthetic {genre.lower()} cover</text>
    </g>
    <g fill="#fff" opacity="0.18">
        <circle cx="960" cy="230" r="44"/>
        <circle cx="1000" cy="230" r="44"/>
        <circle cx="980" cy="198" r="44"/>
    </g>
    <g fill="#fff" opacity="0.20">
        <path d="M150 470 l26 -78 l26 78 z"/>
        <path d="M150 392 h52 v18 h-52z"/>
        <circle cx="710" cy="260" r="10"/>
        <circle cx="760" cy="310" r="6"/>
        <circle cx="810" cy="360" r="4"/>
    </g>
</svg>'''


def save_svg_cover(path, title, genre, index):
        with open(path, 'w', encoding='utf-8') as fh:
                fh.write(make_genre_svg(title, genre, index))

for i, s in enumerate(stories, start=1):
    genre = s.get('genre') or ''
    query = GENRE_MAP.get(genre, None)
    if not query:
        query = 'books'

    if FORCE_GENRE_SVG:
        filename = f'cover_{i}.svg'
        out_path = os.path.join(OUT_DIR, filename)
        save_svg_cover(out_path, s.get('title') or 'Untitled story', genre or 'Story', i)
        rel_path = f'/uploads/{filename}'
        db.stories.update_one({'_id': s['_id']}, {'$set': {'cover_image_url': rel_path, 'updated_at': datetime.utcnow()}})
        print(f'Wrote {out_path} -> set story {s.get("_id")} cover to {rel_path} (genre art: {genre or "Story"})')
        continue

    query_escaped = quote(query)

    # candidate generators in order of preference
    candidates = []
    # Unsplash (keyword search)
    candidates.append(lambda: f'https://source.unsplash.com/1200x800/?{query_escaped}')
    # LoremFlickr (keyword search)
    candidates.append(lambda: f'https://loremflickr.com/1200/800/{query_escaped}')
    # Seeded Picsum (consistent aesthetic per query)
    candidates.append(lambda: f'https://picsum.photos/seed/{quote(query)}/1200/800')
    # PlaceIMG (category-based)
    cat = PLACEIMG_CAT.get(genre, 'arch')
    candidates.append(lambda: f'https://placeimg.com/1200/800/{cat}')
    # Picsum (random) - fallback
    candidates.append(lambda: 'https://picsum.photos/1200/800')

    img_bytes = None
    final_url = None
    final_resp = None

    for gen in candidates:
        url_try = gen()
        tries = 0
        max_tries = 4 if 'unsplash' in url_try else 3
        while tries < max_tries and not img_bytes:
            tries += 1
            try:
                resp = session.get(url_try, timeout=20, allow_redirects=True)
                ctype = resp.headers.get('content-type','')
                if resp.status_code == 200 and ctype.startswith('image'):
                    img_bytes = resp.content
                    final_url = resp.url
                    final_resp = resp
                    break
                # some hosts return HTML error pages with 200; check URL for image extension
                if resp.status_code == 200 and any(resp.url.lower().endswith(ext) for ext in ('.jpg','.jpeg','.png','.webp','.svg')):
                    img_bytes = resp.content
                    final_url = resp.url
                    final_resp = resp
                    break
                else:
                    print(f'Warning: got status {resp.status_code} for {url_try} (try {tries})')
            except Exception as e:
                print(f'Error fetching {url_try}: {e} (try {tries})')
            time.sleep(1 + tries)

        if img_bytes:
            break

    if not img_bytes:
        print(f'Failed to download image for story {s.get("_id")} genre={genre}; skipping')
        continue

    # choose extension from the final response
    if final_resp is not None:
        ctype = final_resp.headers.get('content-type','image/jpeg')
    else:
        ctype = 'image/jpeg'
    ext = 'jpg'
    if 'png' in ctype:
        ext = 'png'
    elif 'svg' in ctype:
        ext = 'svg'
    elif 'webp' in ctype:
        ext = 'webp'

    filename = f'cover_{i}.{ext}'
    out_path = os.path.join(OUT_DIR, filename)
    with open(out_path, 'wb') as f:
        f.write(img_bytes)

    rel_path = f'/uploads/{filename}'
    db.stories.update_one({'_id': s['_id']}, {'$set': {'cover_image_url': rel_path, 'updated_at': datetime.utcnow()}})
    print(f'Wrote {out_path} -> set story {s.get("_id")} cover to {rel_path} (source: {final_url})')

print('✓ Done downloading and updating covers')
