"""
Database connection and collection management.
Handles MongoDB connection and collection initialization.
"""

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

try:
    from mongomock import MongoClient as MockMongoClient
except ImportError:  # pragma: no cover - optional fallback dependency
    MockMongoClient = None
from app.config import settings

# MongoDB client instance (initialized at startup)
_client: MongoClient = None
_db = None


def connect_to_mongodb():
    """
    Establish connection to MongoDB.
    Called during FastAPI startup event.
    """
    global _client, _db
    try:
        _client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Verify connection
        _client.admin.command('ping')
        _db = _client[settings.DATABASE_NAME]
        print("✓ Connected to MongoDB successfully")
        
        # Initialize collections with indexes
        initialize_collections()
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        if MockMongoClient is None:
            print(f"✗ Failed to connect to MongoDB: {e}")
            raise

        _client = MockMongoClient()
        _db = _client[settings.DATABASE_NAME]
        print("⚠ MongoDB unavailable, using in-memory mongomock database")
        initialize_collections()


def disconnect_from_mongodb():
    """
    Close MongoDB connection.
    Called during FastAPI shutdown event.
    """
    global _client
    if _client:
        _client.close()
        print("✓ Disconnected from MongoDB")


def get_database():
    """Get the MongoDB database instance."""
    return _db


def initialize_collections():
    """
    Initialize MongoDB collections with proper indexes.
    Called during startup to ensure collections exist.
    """
    db = get_database()
    
    # Users collection
    if "users" not in db.list_collection_names():
        db.create_collection("users")
    db.users.create_index("email", unique=True)
    
    # Stories collection
    if "stories" not in db.list_collection_names():
        db.create_collection("stories")
    db.stories.create_index("user_id")
    db.stories.create_index("status")
    db.stories.create_index("genre")
    db.stories.create_index("tags")
    
    # Chapters collection
    if "chapters" not in db.list_collection_names():
        db.create_collection("chapters")
    db.chapters.create_index("story_id")
    db.chapters.create_index("chapter_number")

    # Social collections
    for collection_name, indexes in {
        "comments": ["story_id", "chapter_id", "user_id"],
        "votes": ["story_id", "user_id"],
        "follows": ["follower_id", "following_id"],
    }.items():
        if collection_name not in db.list_collection_names():
            db.create_collection(collection_name)
        for index_name in indexes:
            db[collection_name].create_index(index_name)

    print("✓ Initialized MongoDB collections and indexes")


def get_user_collection():
    """Get the users collection."""
    return get_database()["users"]


def get_story_collection():
    """Get the stories collection."""
    return get_database()["stories"]


def get_chapter_collection():
    """Get the chapters collection."""
    return get_database()["chapters"]


def get_like_collection():
    """Get the likes collection."""
    return get_database()["likes"]


def get_bookmark_collection():
    """Get the bookmarks collection."""
    return get_database()["bookmarks"]


def get_reading_history_collection():
    """Get the reading_history collection."""
    return get_database()["reading_history"]


def get_comment_collection():
    """Get the comments collection."""
    return get_database()["comments"]


def get_vote_collection():
    """Get the votes collection."""
    return get_database()["votes"]


def get_follow_collection():
    """Get the follows collection."""
    return get_database()["follows"]

