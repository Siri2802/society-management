from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

from app.core.config import settings
from app.middleware.firebase_auth import FirebaseAuthMiddleware

from app.routers import auth, users, visitors, maintenance, finance, announcements, admin

# Setup basic logging
logger.remove()
logger.add(sys.stderr, level="INFO")

# Init FastAPI instance
app = FastAPI(
    title="Society Management API",
    description="Backend API for Society Management Dashboard Built with FastAPI and PostgreSQL",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS, # Reads from .env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Custom Middleware for Token Parsing
# We exempt /auth/register, /docs, /openapi.json from strict frontend bearer requirement
# though in this specific setup, they are soft checks anyway.
app.add_middleware(
    FirebaseAuthMiddleware, 
    exempt_routes=["/docs", "/openapi.json", "/redoc", "/admin/health"]
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(visitors.router)
app.include_router(maintenance.router)
app.include_router(finance.router)
app.include_router(announcements.router)
app.include_router(admin.router)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Society Management Server...")
    # Any DB connection setup logic could optionally be explicitly awaited here

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Society Management Server...")
    # Any cleanup

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Society Management API"}
