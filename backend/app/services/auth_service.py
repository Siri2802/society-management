from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from app.models.user import User

logger = logging.getLogger(__name__)

async def register_or_fetch_user(decoded_token: dict, db: AsyncSession) -> User:
    """
    Checks if a user with the Firebase UID already exists in the DB,
    creates one if not (upsert pattern), and returns the user object.
    """
    uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    name = decoded_token.get("name", "Unknown User")
    
    if not uid:
        raise ValueError("Decoded token does not contain a uid")

    # Check if user already exists
    result = await db.execute(select(User).where(User.firebase_uid == uid))
    user = result.scalars().first()

    if user:
        # Note: we might want to update email/name if it changed in Firebase
        return user

    # Create new user
    user = User(
        firebase_uid=uid,
        email=email,
        name=name,
        # role defaults to resident, flat_number is left null until updated
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    logger.info(f"Registered new user: {user.id}")
    return user

async def get_user_by_firebase_uid(uid: str, db: AsyncSession) -> User | None:
    """
    Helper to fetch a user directly by their firebase uid.
    """
    result = await db.execute(select(User).where(User.firebase_uid == uid, User.status == "active"))
    return result.scalars().first()
