import os
import requests

EXCHANGE_RATE_API_KEY = os.getenv("EXCHANGE_RATE_API_KEY", "mock_exchange_key")
BASE_CURRENCY = "AED"

def get_exchange_rate(target_currency: str) -> float:
    # This is a mock since we might not have a real key during build
    if EXCHANGE_RATE_API_KEY == "mock_exchange_key" or not EXCHANGE_RATE_API_KEY:
        mock_rates = {"USD": 0.27, "INR": 22.5, "EUR": 0.25, "GBP": 0.21, "AUD": 0.41, "AED": 1.0}
        return mock_rates.get(target_currency, 1.0)
    
    url = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_RATE_API_KEY}/latest/{BASE_CURRENCY}"
    try:
        resp = requests.get(url)
        data = resp.json()
        if data.get("result") == "success":
            return data["conversion_rates"].get(target_currency, 1.0)
    except Exception as e:
        print(f"Error fetching exchange rate: {e}")
    return 1.0

def convert_currency(amount_aed: float, target_currency: str) -> float:
    rate = get_exchange_rate(target_currency)
    return round(amount_aed * rate, 2)
