"""
Seed sample users, stories, and chapters into the development database.
Run with the activated virtualenv from repository root:

    python backend/scripts/seed_sample_data.py

This script is idempotent for users (reuses by email) but will always insert new stories/chapters.
"""
from datetime import datetime
from textwrap import dedent

from app.database import connect_to_mongodb, get_database, disconnect_from_mongodb

SAMPLE_BOOKS = [
    {
        "author_email": "seed_author1@example.com",
        "author_username": "seed_author1",
        "title": "The Winter Archive",
        "description": "A hidden library beneath the snow reveals the truth behind a missing heir.",
        "genre": "Fantasy",
        "tags": ["fantasy", "archives", "secrets"],
        "chapters": [
            {
                "title": "Chapter 1: The Door Under Snow",
                "content": dedent(
                    """
                    Mara Vale had spent six winters mapping the same frozen hill, always stopping at the old cedar tree.
                    On the seventh winter, the earth gave way beneath her boots and revealed a brass door sealed with ash-blue runes.

                    She opened it with the only key she had ever kept from her father, and the air that rose from below smelled of paper, cedar, and rain.

                    Inside was the Winter Archive, a library that remembered every promise ever broken in the kingdom.
                    At its center waited a blank ledger with her family crest pressed into the cover.
                    """
                ).strip(),
            },
            {
                "title": "Chapter 2: The Missing Name",
                "content": dedent(
                    """
                    The archivist, a gray-eyed woman named Elowen, explained that the ledger only opened for heirs who were never meant to inherit.
                    Mara found her brother's name crossed out in silver ink, and beneath it, a path leading to a city no map admitted existed.

                    When she touched the page, a message appeared: Find the child who was taken, or the archive will freeze the throne forever.
                    Outside, snow began to fall in the shape of feathers.
                    """
                ).strip(),
            },
        ],
    },
    {
        "author_email": "seed_author2@example.com",
        "author_username": "seed_author2",
        "title": "Paper Hearts",
        "description": "Two strangers keep finding each other in the same city until the distance between them starts to feel deliberate.",
        "genre": "Romance",
        "tags": ["romance", "second-chance", "city-life"],
        "chapters": [
            {
                "title": "Chapter 1: The Coffee Receipt",
                "content": dedent(
                    """
                    Jules never planned to keep the receipt from the corner café, but the stranger who left it behind had written a phone number on the back in blue ink.
                    She found him again three days later at the tram stop, reading the same book she had dropped in the café line.

                    He laughed when she mentioned the receipt, said he had been hoping the universe was less subtle than it looked.
                    By the time the tram arrived, both of them were already pretending this was not the beginning of something.
                    """
                ).strip(),
            },
            {
                "title": "Chapter 2: One More Block",
                "content": dedent(
                    """
                    They walked two blocks too far because neither of them wanted the evening to end at the station lights.
                    Jules learned his name was Adrian, that he repaired old cameras, and that he had once been in love with a city that no longer remembered him.

                    When he asked if she believed in timing, she told him she only believed in the people who kept showing up.
                    He smiled like he had been waiting to hear exactly that.
                    """
                ).strip(),
            },
        ],
    },
    {
        "author_email": "seed_author3@example.com",
        "author_username": "seed_author3",
        "title": "Howling at Dusk",
        "description": "A reluctant wolf heir refuses to obey the pack and discovers the real war is about who gets to choose the future.",
        "genre": "Werewolf",
        "tags": ["werewolf", "pack", "identity"],
        "chapters": [
            {
                "title": "Chapter 1: The Pack Call",
                "content": dedent(
                    """
                    When the pack called for Asher to kneel, he stayed standing in the red dust of the ridge.
                    His mother had warned him that the alpha's blessing was a leash, not a gift, and the moonlight across the valley proved her right.

                    A hunt marker burned in the grass behind him, left there by someone who wanted a message more than a fight.
                    Asher turned toward the forest and chose the path the pack had forbidden for generations.
                    """
                ).strip(),
            },
            {
                "title": "Chapter 2: The Borrowed Fang",
                "content": dedent(
                    """
                    Deep in the pines, he met Sera, an exile with a scar across her throat and an old clan sigil stitched into her coat.
                    She told him the pack elders had been hiding a treaty with the hunters, one that traded wolves for peace.

                    Asher realized the war had already started, just quietly, in rooms no one was allowed to enter.
                    The borrowed fang in his pocket grew warm, as if remembering a promise made long before his birth.
                    """
                ).strip(),
            },
        ],
    },
    {
        "author_email": "seed_author4@example.com",
        "author_username": "seed_author4",
        "title": "Frames of Us",
        "description": "A comic artist redraws the past and discovers that some panels refuse to stay on the page.",
        "genre": "Comic",
        "tags": ["comic", "art", "time-slip"],
        "chapters": [
            {
                "title": "Chapter 1: The Last Blank Panel",
                "content": dedent(
                    """
                    Every night, Nia left one panel blank in her sketchbook so the page could breathe.
                    On the night the rain started, the blank square filled itself with a drawing of her childhood apartment, down to the cracked mirror by the door.

                    In the reflection, her younger brother was standing where he had vanished ten years ago.
                    Nia traced the outline with trembling fingers and watched the ink move.
                    """
                ).strip(),
            },
            {
                "title": "Chapter 2: Speech Bubbles",
                "content": dedent(
                    """
                    The speech bubbles began appearing above real people, and most of them said the things nobody dared speak aloud.
                    Nia followed the bubbles to an abandoned studio where an unfinished comic strip lay stacked in boxes under a dust sheet.

                    The final page showed her holding the same sketchbook.
                    Underneath, in careful lettering, were the words: redraw the past, and the past will redraw you.
                    """
                ).strip(),
            },
        ],
    },
    {
        "author_email": "seed_author5@example.com",
        "author_username": "seed_author5",
        "title": "Ink and Thunder",
        "description": "A novelist discovers the ending is writing back and the manuscript is no longer obeying her hand.",
        "genre": "Novels",
        "tags": ["writing", "mystery", "metafiction"],
        "chapters": [
            {
                "title": "Chapter 1: The Sentence That Changed",
                "content": dedent(
                    """
                    Vivian had rewritten the opening line twelve times when the thirteenth version appeared on the screen by itself.
                    It named her by the nickname only one person in the world still used, and it ended with a line she had never typed: don't look behind you when it rains.

                    Thunder rolled across the apartment windows, and every file in the project folder renamed itself.
                    The manuscript had finally decided to speak.
                    """
                ).strip(),
            },
            {
                "title": "Chapter 2: Margins in Red",
                "content": dedent(
                    """
                    By midnight, Vivian found red annotations in the margins of her printout, each one pointing out a mistake that had not existed yesterday.
                    The notes described a missing chapter, a missing character, and a missing promise she had once made to her brother.

                    When she turned to the final page, the thunder outside answered with three sharp knocks at the door.
                    Something inside the book had just arrived.
                    """
                ).strip(),
            },
        ],
    },
    {
        "author_email": "seed_author6@example.com",
        "author_username": "seed_author6",
        "title": "The Quiet Chapter",
        "description": "A small-town romance grows through handwritten notes, rainstorms, and the quiet courage to stay.",
        "genre": "New Adult",
        "tags": ["new adult", "small-town", "slow-burn"],
        "chapters": [
            {
                "title": "Chapter 1: A Note in the Locker",
                "content": dedent(
                    """
                    Lena found the note in her locker between algebra worksheets and a forgotten scarf.
                    It said, If you need someone to sit with at lunch, I know a good corner by the window.

                    The handwriting belonged to Caleb, the mechanic's son who repaired bikes behind the diner and never looked directly at anyone for too long.
                    Lena folded the note into her pocket and spent the rest of the morning wondering if kindness could be this specific.
                    """
                ).strip(),
            },
            {
                "title": "Chapter 2: The Rain Shelter",
                "content": dedent(
                    """
                    They met again under the pharmacy awning when the rain came down hard enough to turn Main Street into a river.
                    Caleb offered half his umbrella and a story about the first engine he ever fixed.

                    Lena told him about the library where she hid when home felt too loud.
                    By the time the storm passed, both of them were still standing there, unwilling to be the first to leave.
                    """
                ).strip(),
            },
        ],
    },
    {
        "author_email": "seed_author7@example.com",
        "author_username": "seed_author7",
        "title": "Short Story Club",
        "description": "A tight collection of sharp, memorable scenes that land quickly and linger long after the last line.",
        "genre": "Short Story",
        "tags": ["short story", "collection", "literary"],
        "chapters": [
            {
                "title": "Chapter 1: The Last Seat",
                "content": dedent(
                    """
                    The bus always saved the last seat for the woman in the yellow coat, even though the driver insisted he never saw her board.
                    On the morning the route changed, she left a postcard behind that showed the city as it had looked fifty years earlier.

                    The card had only one line written on the back: thank you for remembering me when the streets could not.
                    """
                ).strip(),
            },
            {
                "title": "Chapter 2: A Small Orchard",
                "content": dedent(
                    """
                    In the orchard behind the house, the pears ripened in the shape of tiny lanterns.
                    A boy who had not spoken in months whispered to one of them and heard a voice answer from the branches.

                    It told him that some stories are planted, not told, and that the ones worth keeping usually start underground.
                    """
                ).strip(),
            },
        ],
    },
    {
        "author_email": "seed_author8@example.com",
        "author_username": "seed_author8",
        "title": "Fanfic After Midnight",
        "description": "A devoted reader writes a bold alternate ending that accidentally starts becoming canon.",
        "genre": "Fanfiction",
        "tags": ["fanfiction", "alternate-universe", "late-night"],
        "chapters": [
            {
                "title": "Chapter 1: Tag the Archive",
                "content": dedent(
                    """
                    At 12:04 a.m., Rowan posted the first chapter of the fix-it fic no one had asked for but everyone secretly needed.
                    It gave the villain a softer backstory, the hero an honest apology, and the side character a chance to live past the final battle.

                    By sunrise, readers were leaving comments that sounded less like fandom and more like prophecy.
                    """
                ).strip(),
            },
            {
                "title": "Chapter 2: Canon Drift",
                "content": dedent(
                    """
                    The next update changed a detail Rowan had not written.
                    A hallway that existed only in the source material appeared in the comments thread, and a character who should have stayed fictional sent a message asking why their ending had changed.

                    Rowan stared at the screen and realized the story had started to answer back.
                    """
                ).strip(),
            },
        ],
    },
]


def ensure_user(db, email, username):
    user = db.users.find_one({"email": email})
    if user:
        return user["_id"]

    now = datetime.utcnow()
    doc = {
        "email": email,
        "username": username,
        "hashed_password": "seed-placeholder",
        "bio": "Sample seeded user",
        "avatar_url": "",
        "is_active": True,
        "is_verified": True,
        "created_at": now,
        "updated_at": now,
    }
    res = db.users.insert_one(doc)
    return res.inserted_id


def seed():
    connect_to_mongodb()
    db = get_database()

    created = 0
    for index, book in enumerate(SAMPLE_BOOKS, start=1):
        author_id = ensure_user(db, book["author_email"], book["author_username"])
        now = datetime.utcnow()

        TOTAL_COVERS = 25
        cover_index = (index % TOTAL_COVERS) or TOTAL_COVERS
        story_doc = {
            "user_id": author_id,
            "title": book["title"],
            "description": book["description"],
            "genre": book["genre"],
            "tags": book["tags"],
            "status": "published",
            "cover_image_url": f"/uploads/cover_{cover_index}.svg",
            "chapter_count": 0,
            "created_at": now,
            "updated_at": now,
        }
        res = db.stories.insert_one(story_doc)
        story_id = res.inserted_id

        for c, chapter in enumerate(book["chapters"], start=1):
            chap_doc = {
                "story_id": story_id,
                "user_id": author_id,
                "title": chapter["title"],
                "content": chapter["content"],
                "chapter_number": c,
                "status": "published",
                "created_at": now,
                "updated_at": now,
            }
            db.chapters.insert_one(chap_doc)

        db.stories.update_one({"_id": story_id}, {"$set": {"chapter_count": len(book["chapters"])}})
        created += 1
        print(f"Inserted story {index} with {len(book['chapters'])} chapters")

    print(f"✓ Seeded {created} stories")
    disconnect_from_mongodb()


if __name__ == "__main__":
    seed()
