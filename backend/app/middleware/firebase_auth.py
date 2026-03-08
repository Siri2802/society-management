from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status
from typing import Callable, Awaitable
from loguru import logger

from app.core.firebase import verify_firebase_token

class FirebaseAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exempt_routes=None):
        super().__init__(app)
        self.exempt_routes = exempt_routes or []

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[JSONResponse]]) -> JSONResponse:
        path = request.url.path

        # Allow CORS preflight requests to pass through
        if request.method == "OPTIONS":
            return await call_next(request)

        # Check if the path is in the exempt routes (e.g., /docs, /openapi.json, /redoc)
        # Note: In a production app you might want regex or more robust prefix checking
        if any(path.startswith(route) for route in self.exempt_routes):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing or invalid Authorization header"}
            )

        token = auth_header.split(" ")[1]
        try:
            # We verify the token but we don't hit the DB yet. 
            # The DB hit happens in the get_current_user dependency.
            # This is just a fast front-line defense.
            decoded_token = verify_firebase_token(token)
            # Store the decoded token in request state so dependencies can access it
            request.state.firebase_token = decoded_token
            # e.g., request.state.firebase_token["uid"]
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": f"Invalid or expired token. {e}"}
            )

        response = await call_next(request)
        return response
