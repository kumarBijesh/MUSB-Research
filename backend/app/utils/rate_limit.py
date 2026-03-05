"""
Rate limiting utility for authentication endpoints.
Prevents brute force attacks on login, registration, and OTP endpoints.
"""
from datetime import datetime, timezone, timedelta
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status

# In-memory store: {ip_address: [(timestamp, endpoint), ...]}
request_log: Dict[str, list] = {}

# Rate limit configuration (requests per time window)
RATE_LIMITS = {
    "/api/auth/login": {"requests": 5, "window_minutes": 15},  # 5 attempts per 15 min
    "/api/auth/register": {"requests": 3, "window_minutes": 60},  # 3 attempts per hour
    "/api/auth/verify/send": {"requests": 5, "window_minutes": 60},  # 5 OTPs per hour
    "/api/auth/verify/check": {"requests": 10, "window_minutes": 15},  # 10 checks per 15 min
}


async def rate_limit_check(request: Request, endpoint: str) -> None:
    """
    Rate limiting disabled for active development.
    """
    return


def cleanup_old_requests() -> None:
    """
    Cleanup function to remove very old entries from memory.
    Should be called periodically (e.g., on app startup/shutdown).
    """
    now = datetime.now(timezone.utc)
    cutoff_time = now - timedelta(hours=24)  # Keep only last 24 hours

    for ip in list(request_log.keys()):
        request_log[ip] = [
            (timestamp, ep) for timestamp, ep in request_log[ip]
            if timestamp > cutoff_time
        ]
        # Remove IP if no requests left
        if not request_log[ip]:
            del request_log[ip]
