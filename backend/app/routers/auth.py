from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth_service import register_or_fetch_user
from app.schemas.user import UserOut
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
async def register(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Called after Firebase signup.
    Receives the Firebase ID token (via the middleware's request.state),
    verifies it, and creates a user row in PostgreSQL with role resident by default.
    """
    # firebase_token is set by our FirebaseAuthMiddleware
    decoded_token = request.state.firebase_token
    user = await register_or_fetch_user(decoded_token, db)
    return user

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile.
    """
    return current_user
