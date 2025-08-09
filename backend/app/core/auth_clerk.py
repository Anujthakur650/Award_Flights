"""
Clerk JWT verification utilities for FastAPI
"""
from __future__ import annotations

from functools import lru_cache
from typing import Any, Dict, Optional

from fastapi import HTTPException, Request, status
from jwt import decode as jwt_decode
from jwt import PyJWKClient

from app.core.config import settings


@lru_cache(maxsize=1)
def _jwks_url() -> str:
    if settings.CLERK_JWKS_URL:
        return settings.CLERK_JWKS_URL
    if settings.CLERK_DOMAIN:
        return f"https://{settings.CLERK_DOMAIN}/.well-known/jwks.json"
    if settings.CLERK_ISSUER:
        base = settings.CLERK_ISSUER.rstrip("/")
        return f"{base}/.well-known/jwks.json"
    raise RuntimeError("Clerk JWKS URL is not configured. Set CLERK_JWKS_URL or CLERK_DOMAIN or CLERK_ISSUER")


@lru_cache(maxsize=1)
def _jwk_client() -> PyJWKClient:
    return PyJWKClient(_jwks_url())


def verify_clerk_jwt(token: str) -> Dict[str, Any]:
    """
    Verify a Clerk JWT token using JWKS (PyJWT). Returns decoded claims on success.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    try:
        signing_key = _jwk_client().get_signing_key_from_jwt(token).key
        claims = jwt_decode(
            token,
            signing_key,
            algorithms=["RS256"],
            audience=settings.CLERK_AUDIENCE if settings.CLERK_AUDIENCE else None,
            issuer=settings.CLERK_ISSUER if settings.CLERK_ISSUER else None,
        )
        return claims
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}")


def clerk_require_user(request: Request) -> Dict[str, Any]:
    """
    FastAPI dependency that extracts and verifies a Clerk JWT from the Authorization header.
    Attaches claims and returns them. Raises 401 on failure.
    """
    auth_header: Optional[str] = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing or malformed")
    token = auth_header.split(" ", 1)[1]
    claims = verify_clerk_jwt(token)
    return claims
