from fastapi import APIRouter
from services.currency_service import convert_currency
from pydantic import BaseModel

router = APIRouter(prefix="/api/currency", tags=["Currency"])

class CurrencyConvertRequest(BaseModel):
    amount_aed: float
    target_currency: str

@router.post("/convert")
def convert(req: CurrencyConvertRequest):
    converted_amount = convert_currency(req.amount_aed, req.target_currency)
    return {
        "base_currency": "AED",
        "target_currency": req.target_currency,
        "amount_aed": req.amount_aed,
        "converted_amount": converted_amount
    }
