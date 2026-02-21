from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import date, time

class BookingRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    dob: date
    tob_hour: int = Field(ge=0, le=23)
    tob_minute: int = Field(ge=0, le=59)
    country_code: str
    mobile_number: str
    session_date: date
    session_time: time
    time_zone: str = Field(..., description="IST or GST")
    amount_paid: float
    currency_paid: str

class BookingResponse(BookingRequest):
    id: str = Field(alias="_id")
    status: str = "confirmed"
    created_at: str

    class Config:
        populate_by_name = True
