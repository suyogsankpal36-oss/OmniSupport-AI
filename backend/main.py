import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import engine, Base
from seed_data import seed_database
from routers import chat, documents, tickets, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Auto-seed database with realistic enterprise knowledge docs and tickets
    try:
        seed_database()
    except Exception as e:
        print(f"[Lifespan] Seeding note: {e}")
    yield

app = FastAPI(
    title="OmniSupport AI API",
    description="Enterprise-grade AI Customer Support & Knowledge Copilot API with real-time SSE streaming, RAG context injection, and live human agent hand-off.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(tickets.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": "OmniSupport AI",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "gemini_model": settings.GEMINI_MODEL,
        "api_endpoints": [
            "/api/chat/stream",
            "/api/documents",
            "/api/tickets",
            "/api/analytics"
        ]
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "ai_engine": "Gemini / Real-Time SSE Streamer",
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
