import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from core.security import create_access_token, verify_token
from core.db import get_db
from models.availability import UpdateAvailabilityRequest
from models.settings import SettingsRequest
from datetime import timedelta

router = APIRouter(prefix="/api/admin", tags=["Admin"])

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "into_the_star_123")

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.password != ADMIN_PASSWORD or form_data.username != "admin": # Basic check
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(hours=2)
    access_token = create_access_token(
        data={"sub": "admin", "role": "admin"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/bookings")
def get_all_bookings(token: dict = Depends(verify_token)):
    db = get_db()
    bookings_cur = db.bookings.find().sort("created_at", -1)
    bookings = []
    for b in bookings_cur:
        b["_id"] = str(b["_id"])
        bookings.append(b)
    return bookings

@router.get("/availability")
def get_availability(token: dict = Depends(verify_token), date: str = None):
    db = get_db()
    query = {}
    if date:
        query["date"] = date
    avails = list(db.availability.find(query))
    for a in avails:
        a["_id"] = str(a["_id"])
    return avails

@router.post("/availability")
def update_availability(req: UpdateAvailabilityRequest, token: dict = Depends(verify_token)):
    db = get_db()
    result = db.availability.update_one(
        {"date": req.date},
        {"$set": {"slots_ist": [s.model_dump() for s in req.slots_ist], "slots_gst": [s.model_dump() for s in req.slots_gst]}},
        upsert=True
    )
    return {"status": "success", "message": "Availability updated"}

@router.get("/settings")
def get_settings():
    db = get_db()
    settings = db.settings.find_one({"_id": "global_settings"})
    if not settings:
        return {"base_price_aed": 500.0} # Default
    return {"base_price_aed": settings.get("base_price_aed", 500.0)}

@router.post("/settings")
def update_settings(req: SettingsRequest, token: dict = Depends(verify_token)):
    db = get_db()
    db.settings.update_one(
        {"_id": "global_settings"},
        {"$set": {"base_price_aed": req.base_price_aed}},
        upsert=True
    )
    return {"status": "success", "base_price_aed": req.base_price_aed}
