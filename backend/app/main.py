"""
Main FastAPI application entry point.
Initializes routes, middleware, and startup/shutdown events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import connect_to_mongodb, disconnect_from_mongodb

# Initialize FastAPI app
app = FastAPI(
    title="Story Store API",
    description="A full-stack story reading and writing platform with ML recommendations",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
if settings.FILE_STORAGE_TYPE == "local":
    os.makedirs(settings.LOCAL_FILE_STORAGE_PATH, exist_ok=True)
    # Serve static files (uploaded images, etc.)
    app.mount("/uploads", StaticFiles(directory=settings.LOCAL_FILE_STORAGE_PATH), name="uploads")


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup."""
    connect_to_mongodb()


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown."""
    disconnect_from_mongodb()


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API status."""
    return {
        "message": "Story Store API is running",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}



from app.routers import auth, chapters, stories, interactions, recommendations

# Include routers

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(stories.router, prefix="/api/stories", tags=["Stories"])
app.include_router(chapters.router, prefix="/api", tags=["Chapters"])
app.include_router(interactions.router, prefix="/api", tags=["Interactions"])
app.include_router(recommendations.router, prefix="/api", tags=["Recommendations"])



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG
    )
