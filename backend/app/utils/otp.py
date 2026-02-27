import random
import string
from datetime import datetime, timedelta, timezone

# Mock storage for OTPs (In-memory for demo, should be Redis/DB in prod)
otp_store = {}

def generate_otp(identifier: str, purpose: str = "LOGIN", length: int = 6) -> str:
    """Generate a numeric OTP and store it with an expiry and purpose."""
    otp = "".join(random.choices(string.digits, k=length))
    expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Store with purpose to ensure valid action context
    otp_store[f"{identifier}:{purpose}"] = {"code": otp, "expires_at": expiry}
    return otp

def verify_otp(identifier: str, code: str, purpose: str = "LOGIN") -> bool:
    """Verify an OTP for a given identifier and purpose."""
    key = f"{identifier}:{purpose}"
    data = otp_store.get(key)
    if not data:
        return False
    
    expiry = data.get("expires_at")
    if not expiry:
        return False
        
    if isinstance(expiry, str):
        try:
            expiry = datetime.fromisoformat(expiry.replace("Z", "+00:00"))
        except ValueError:
            return False
            
    if datetime.now(timezone.utc) > expiry:
        otp_store.pop(key, None)
        return False
        
    if data.get("code") == code:
        otp_store.pop(key, None) # One-time use
        return True
    
    return False
