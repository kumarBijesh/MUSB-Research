from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import connect_db, close_db
from app.routes import auth, studies, participants, adverse_events, messages, tasks, documents, data_logs, sponsor

settings = get_settings()


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

# ─── CORS ────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
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
