"""Generate a VAPID key pair for Web Push notifications.

Usage:
    python scripts/generate_vapid_keys.py

Copy the printed keys into your backend .env (and Vercel env vars):
    VAPID_PUBLIC_KEY=<public>
    VAPID_PRIVATE_KEY=<private>
    VAPID_SUBJECT_EMAIL=mailto:you@example.com
"""

import base64

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec


def b64urlencode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def main() -> None:
    private_key = ec.generate_private_key(ec.SECP256R1())
    private_raw = private_key.private_numbers().private_value.to_bytes(32, "big")
    public_raw = private_key.public_key().public_bytes(
        serialization.Encoding.X962,
        serialization.PublicFormat.UncompressedPoint,
    )

    print("VAPID_PUBLIC_KEY=" + b64urlencode(public_raw))
    print("VAPID_PRIVATE_KEY=" + b64urlencode(private_raw))
    print("VAPID_SUBJECT_EMAIL=mailto:you@example.com")


if __name__ == "__main__":
    main()