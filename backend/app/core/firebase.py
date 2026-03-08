import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, status
from app.core.config import settings

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred, {
        "projectId": settings.FIREBASE_PROJECT_ID,
    })
except Exception as e:
    # If the credentials file is missing or invalid, we print a warning.
    # In a real setup, we might want to fail hard here or use a mock logic.
    print(f"Warning: Failed to initialize Firebase Admin SDK. {e}")

def verify_firebase_token(token: str) -> dict:
    """
    Verifies a Firebase ID token.
    Raises HTTPException 401 if invalid or expired.
    Returns the decoded token payload.
    """
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase token. {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
