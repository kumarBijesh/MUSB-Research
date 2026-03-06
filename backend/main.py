from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.database import connect_db, close_db
from app.routes import (
    auth, studies, participants, adverse_events, messages, 
    tasks, documents, data_logs, sponsor, audit, scheduling, inventory, admin,
    assessments, notifications, export
)
from app.routes import super_admin

settings = get_settings()

# ─── Rate Limiting ────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per minute"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle hooks."""
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for the MusB Research Virtual Clinical Trial System",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── Security Headers Middleware ──────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    return response

# ─── CORS ────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(studies.router)
app.include_router(participants.router)
app.include_router(adverse_events.router)
app.include_router(messages.router)
app.include_router(tasks.router)
app.include_router(documents.router)
app.include_router(data_logs.router)
app.include_router(sponsor.router)
app.include_router(audit.router)
app.include_router(scheduling.router)
app.include_router(inventory.router)
app.include_router(admin.router)
app.include_router(assessments.router)
app.include_router(notifications.router)
app.include_router(export.router)
app.include_router(super_admin.router)



# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Root"])
def health():
    return {"status": "healthy"}
