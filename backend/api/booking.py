from fastapi import APIRouter, HTTPException
from core.db import get_db
from models.booking import BookingRequest
from datetime import datetime
from bson import ObjectId
from services.email_service import send_booking_confirmation_email, send_admin_alert_email
import os
import razorpay

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

try:
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
        razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    else:
        razorpay_client = None
except Exception as e:
    print(f"Razorpay Client initialization failed: {e}")
    razorpay_client = None

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

@router.get("/availability/{date_str}")
def get_public_availability(date_str: str):
    db = get_db()
    avail = db.availability.find_one({"date": date_str})
    if not avail:
        return {"slots_ist": [], "slots_gst": []}
    
    # Filter out slots that are already booked
    slots_ist = [s for s in avail.get("slots_ist", []) if not s.get("is_booked")]
    slots_gst = [s for s in avail.get("slots_gst", []) if not s.get("is_booked")]
    return {"slots_ist": slots_ist, "slots_gst": slots_gst}

@router.post("/initiate")
def initiate_booking(req: BookingRequest):
    db = get_db()
    
    # Verify the slot is still available
    date_str = req.session_date.isoformat()
    avail = db.availability.find_one({"date": date_str})
    if not avail:
        raise HTTPException(status_code=400, detail="Date not available")
    
    time_str = req.session_time.strftime("%H:%M")
    slot_type = "slots_ist" if req.time_zone == "IST" else "slots_gst"
    slots = avail.get(slot_type, [])
    
    found_slot = next((s for s in slots if s["time"] == time_str and not s.get("is_booked")), None)
    if not found_slot:
        raise HTTPException(status_code=400, detail="Slot is no longer available")
    
    booking_data = req.model_dump(mode="json")
    booking_data["created_at"] = datetime.utcnow().isoformat()
    booking_data["status"] = "pending_payment"
    
    res = db.bookings.insert_one(booking_data)
    
    amount_in_smallest_unit = int(req.amount_paid * 100)
    order_data = {
        "amount": amount_in_smallest_unit,
        "currency": req.currency_paid,
        "receipt": str(res.inserted_id)
    }
    
    order_id = f"mock_order_{res.inserted_id}"
    try:
        if razorpay_client:
            razorpay_order = razorpay_client.order.create(data=order_data)
            order_id = razorpay_order["id"]
    except Exception as e:
        print(f"Error creating Razorpay order: {e}")
    
    return {
        "status": "success", 
        "booking_id": str(res.inserted_id),
        "razorpay_order_id": order_id,
        "amount": amount_in_smallest_unit,
        "currency": req.currency_paid
    }

@router.post("/verify/{booking_id}")
def verify_payment_mock(booking_id: str):
    db = get_db()
    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking ID format")
        
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if booking.get("status") == "confirmed":
        return {"status": "already_verified"}
        
    # Mark booking as confirmed
    db.bookings.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": "confirmed"}})
    
    # Mark slot as booked in availability
    date_str = booking["session_date"]
    time_str = booking["session_time"].split(":")[0] + ":" + booking["session_time"].split(":")[1] # Ensure format
    slot_type = "slots_ist" if booking["time_zone"] == "IST" else "slots_gst"
    
    db.availability.update_one(
        {"date": date_str, f"{slot_type}.time": time_str},
        {"$set": {f"{slot_type}.$.is_booked": True}}
    )
    
    # Trigger Emails
    send_booking_confirmation_email(
        booking["email"], booking["first_name"], 
        booking["session_date"], booking["session_time"], booking["time_zone"]
    )
    send_admin_alert_email(booking)
    
    return {"status": "success"}
