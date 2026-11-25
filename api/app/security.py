from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import jwt
from pwdlib import PasswordHash

from app.config import get_settings

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, encoded_hash: str) -> bool:
    return password_hash.verify(password, encoded_hash)


def issue_access_token(user_id: UUID) -> tuple[str, int]:
    settings = get_settings()
    expires = settings.access_token_minutes * 60
    now = datetime.now(timezone.utc)
    claims = {
        "sub": str(user_id),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "iat": now,
        "exp": now + timedelta(seconds=expires),
        "jti": str(uuid4()),
    }
    token = jwt.encode(claims, settings.jwt_secret_key, algorithm="HS256")
    return token, expires


def read_access_token(token: str) -> UUID:
    settings = get_settings()
    claims = jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=["HS256"],
        audience=settings.jwt_audience,
        issuer=settings.jwt_issuer,
        options={"require": ["sub", "iss", "aud", "iat", "exp", "jti"]},
    )
    return UUID(claims["sub"])
