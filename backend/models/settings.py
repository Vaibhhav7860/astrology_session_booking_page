from pydantic import BaseModel

class SettingsRequest(BaseModel):
    base_price_aed: float
