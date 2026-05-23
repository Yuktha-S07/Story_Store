# Testing

This project uses pytest for backend integration tests.

## Prerequisites

- MongoDB running locally (default: `mongodb://localhost:27017`).
- Python virtual environment set up in `backend/venv`.

## Run Backend Tests

From the repo root:

```
cd backend
.\venv\Scripts\python.exe -m pytest
```

### Notes

- Tests use the `story_store_test` database by default.
- Collections are cleared after each test run.
- If you use a different MongoDB URI, set `MONGODB_URI` before running tests.

## Run Frontend (Manual Verification)

```
cd frontend
npm run dev
```

Then verify:
- Login/logout
- Create/update story
- Add chapter
- Like/bookmark
- Read chapter to record history
- Recommendations appear on home and story detail pages
