import random
import string
from datetime import datetime, timedelta, timezone

# Mock storage for OTPs (In-memory for demo, should be Redis/DB in prod)
otp_store = {}

def generate_otp(identifier: str, length: int = 6) -> str:
    """Generate a numeric OTP and store it with an expiry."""
    otp = "".join(random.choices(string.digits, k=length))
    expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    otp_store[identifier] = {"code": otp, "expires_at": expiry}
    return otp

def verify_otp(identifier: str, code: str) -> bool:
    """Verify an OTP for a given identifier (email or phone)."""
    data = otp_store.get(identifier)
    if not data:
        return False
    
    expiry = data.get("expires_at")
    if not expiry:
        return False
        
    # Handle both datetime and potential string serialization
    if isinstance(expiry, str):
        try:
            expiry = datetime.fromisoformat(expiry.replace("Z", "+00:00"))
        except ValueError:
            return False
            
    if datetime.now(timezone.utc) > expiry:
        otp_store.pop(identifier, None)
        return False
        
    if data.get("code") == code:
        otp_store.pop(identifier, None) # One-time use
        return True
    
    return False
