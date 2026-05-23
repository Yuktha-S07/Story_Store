# Database Schema - MongoDB Collections

This document describes the structure and fields of all MongoDB collections used in the Story Store application.

---

## Users Collection

Stores user account information and authentication details.

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  username: String (required),
  password: String (bcrypt hashed, required),
  full_name: String,
  bio: String,
  avatar_url: String (optional),
  profile_image_url: String (optional),
  is_active: Boolean (default: true),
  is_verified: Boolean (default: false),
  created_at: ISODate,
  updated_at: ISODate,
  last_login: ISODate,
  
  // Statistics
  total_stories: Integer (default: 0),
  total_likes: Integer (default: 0),
  total_followers: Integer (default: 0),
}
```

**Indexes:**
- `email` (unique)

---

## Stories Collection

Stores story metadata and information.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (references users._id, required),
  title: String (required),
  description: String,
  cover_image_url: String (optional),
  genre: String (required),
  tags: Array<String>,
  status: String (enum: "draft", "published", default: "draft"),
  is_completed: Boolean (default: false),
  
  // Content
  short_summary: String,
  language: String (default: "English"),
  
  // Statistics
  view_count: Integer (default: 0),
  like_count: Integer (default: 0),
  bookmark_count: Integer (default: 0),
  comment_count: Integer (default: 0),
  chapter_count: Integer (default: 0),
  
  // Timestamps
  created_at: ISODate,
  updated_at: ISODate,
  published_at: ISODate (optional),
  
  // Additional metadata
  mature_content: Boolean (default: false),
  allow_comments: Boolean (default: true),
}
```

**Indexes:**
- `user_id`
- `status`
- `genre`
- `tags`
- `created_at`

---

## Chapters Collection

Stores individual chapters/parts of stories.

```javascript
{
  _id: ObjectId,
  story_id: ObjectId (references stories._id, required),
  user_id: ObjectId (references users._id, required),
  chapter_number: Integer (required),
  title: String (required),
  content: String (rich text or markdown, required),
  summary: String (optional),
  
  // Reading information
  read_count: Integer (default: 0),
  word_count: Integer,
  estimated_read_time_minutes: Integer,
  
  // Statistics
  like_count: Integer (default: 0),
  comment_count: Integer (default: 0),
  
  // Status
  status: String (enum: "draft", "published", default: "draft"),
  is_published: Boolean (default: false),
  
  // Timestamps
  created_at: ISODate,
  updated_at: ISODate,
  published_at: ISODate (optional),
}
```

**Indexes:**
- `story_id`
- `user_id`
- `chapter_number`
- `status`

---

## Likes Collection

Tracks which users have liked which stories.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (references users._id, required),
  story_id: ObjectId (references stories._id, required),
  created_at: ISODate
}
```

**Indexes:**
- `user_id`
- `story_id`
- `created_at`

---

## Bookmarks Collection

Stores user bookmarks for specific chapters in stories.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (references users._id, required),
  story_id: ObjectId (references stories._id, required),
  chapter_id: ObjectId (references chapters._id, required),
  created_at: ISODate
}
```

**Indexes:**
- `user_id`
- `story_id`
- `created_at`

---

## Reading History Collection

Tracks the reading progress of users.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (references users._id, required),
  story_id: ObjectId (references stories._id, required),
  chapter_id: ObjectId (references chapters._id, required),
  last_read_at: ISODate
}
```

**Indexes:**
- `user_id`
- `story_id`
- `last_read_at`

---

## Future Collections (Phase 5+)

### Comments Collection
```javascript
{
  _id: ObjectId,
  story_id: ObjectId,
  chapter_id: ObjectId,
  user_id: ObjectId,
  comment_text: String,
  likes_count: Integer,
  created_at: ISODate,
  updated_at: ISODate,
}
```

### Follows Collection
```javascript
{
  _id: ObjectId,
  follower_id: ObjectId,
  following_id: ObjectId,
  created_at: ISODate,
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  notification_type: String,
  content: String,
  related_story_id: ObjectId,
  is_read: Boolean,
  created_at: ISODate,
}
```

---

## Database Connection String Examples

### Local MongoDB
```
mongodb://localhost:27017/story_store
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/story_store?retryWrites=true&w=majority
```

---

## Best Practices

1. **Always use ObjectId for foreign key references**
2. **Index fields used in queries frequently**
3. **Keep timestamp fields (created_at, updated_at) in all documents**
4. **Use compound indexes for multi-field query combinations**
5. **Denormalize counts (like_count, view_count) for fast retrieval**
6. **Use soft deletes when needed (add is_deleted: Boolean)**
7. **Validate data types and required fields at the application level**

---

## Data Retention & Cleanup

- User deletion: Soft delete (add is_deleted: true) or hard delete (remove from DB)
- Old reading history: Keep indefinitely or archive after 1 year
- Draft stories: Keep for lifetime of account
- Deleted stories: Consider soft delete and retention period
