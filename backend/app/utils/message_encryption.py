"""
Server-side encryption for messages.
Uses AES-256-GCM with a key derived from the app secret.
"""
import base64
import hashlib
import logging
import os

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from ..config import settings

logger = logging.getLogger(__name__)

NONCE_LENGTH = 12
TAG_LENGTH = 16

def _derive_key(secret: str | None = None) -> bytes:
    """Derive a 256-bit AES key from the message encryption secret (stable across restarts)."""
    source = secret or settings.MESSAGE_ENCRYPTION_KEY
    return hashlib.sha256(source.encode("utf-8")).digest()


def _legacy_jwt_key() -> bytes:
    """Key derived from the old JWT_SECRET-based scheme, used for migration/backward compat."""
    return hashlib.sha256(settings.JWT_SECRET.encode("utf-8")).digest()


def encrypt_content(content: str) -> tuple[str, str]:
    """
    Encrypt plaintext content with AES-256-GCM.
    Returns (ciphertext_b64, nonce_b64).
    """
    key = _derive_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(NONCE_LENGTH)
    plaintext = content.encode("utf-8")
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return base64.b64encode(ciphertext).decode("ascii"), base64.b64encode(nonce).decode("ascii")


def decrypt_content(ciphertext_b64: str, nonce_b64: str) -> str:
    """
    Decrypt AES-256-GCM ciphertext using the stored nonce.
    Returns plaintext string.
    Tries the current key first, then the legacy JWT_SECRET-derived key for
    messages that were encrypted before this fix.
    """
    keys_to_try = [_derive_key(), _legacy_jwt_key()]
    last_exc = None
    for key in keys_to_try:
        try:
            aesgcm = AESGCM(key)
            ciphertext = base64.b64decode(ciphertext_b64)
            nonce = base64.b64decode(nonce_b64)
            plaintext = aesgcm.decrypt(nonce, ciphertext, None)
            return plaintext.decode("utf-8")
        except Exception as exc:
            last_exc = exc
    logger.warning(
        "Failed to decrypt message (ciphertext len=%s, nonce len=%s): %s",
        len(ciphertext_b64),
        len(nonce_b64),
        last_exc,
    )
    return "[Unable to decrypt this message]"