"""
Endpoints protected by Clerk authentication
"""
from fastapi import APIRouter, Depends

from app.core.auth_clerk import clerk_require_user

router = APIRouter()


@router.get("/me")
async def clerk_me(claims: dict = Depends(clerk_require_user)):
    """Return the verified Clerk JWT claims for the current user."""
    # Common Clerk claim fields: sub (user_id), sid (session_id), org_id, email, etc.
    return {
        "user_id": claims.get("sub"),
        "session_id": claims.get("sid"),
        "org_id": claims.get("org_id"),
        "email": claims.get("email"),
        "claims": claims,
    }
