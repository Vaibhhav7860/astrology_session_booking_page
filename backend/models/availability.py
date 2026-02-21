from pydantic import BaseModel, Field
from typing import List
from datetime import date

class Slot(BaseModel):
    time: str
    is_booked: bool = False

class AvailabilityModel(BaseModel):
    id: str = Field(alias="_id")
    date: str # YYYY-MM-DD
    slots_ist: List[Slot] = []
    slots_gst: List[Slot] = []

class UpdateAvailabilityRequest(BaseModel):
    date: str
    slots_ist: List[Slot]
    slots_gst: List[Slot]
