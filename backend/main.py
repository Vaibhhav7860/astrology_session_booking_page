from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.db import get_db
from api.admin import router as admin_router
from api.booking import router as booking_router
from api.currency import router as currency_router

app = FastAPI(
    title="INTO THE STAR - Session Booking API",
    description="Backend API for managing astrologer sessions and availability.",
    version="1.0.0"
)

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    db = get_db()
    try:
        # Simple ping to check db status
        db.command('ping')
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    return {"status": "ok", "db": db_status}

app.include_router(admin_router)
app.include_router(booking_router)
app.include_router(currency_router)
