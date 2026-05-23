import os
import uuid

from fastapi import UploadFile

from app.config import settings


async def save_cover_image(file: UploadFile | None) -> str:
    """Save uploaded cover image and return public URL path."""
    if not file or not file.filename:
        return ""

    if settings.FILE_STORAGE_TYPE != "local":
        raise ValueError("Only local file storage is currently implemented")

    ext = os.path.splitext(file.filename)[1].lower()
    allowed = {".jpg", ".jpeg", ".png", ".webp"}
    if ext not in allowed:
        raise ValueError("Unsupported image format. Use jpg, jpeg, png, or webp")

    file_name = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(settings.LOCAL_FILE_STORAGE_PATH, file_name)

    contents = await file.read()
    with open(save_path, "wb") as out:
        out.write(contents)

    return f"/uploads/{file_name}"
