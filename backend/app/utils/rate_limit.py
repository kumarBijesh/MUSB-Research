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
    Check if a request should be allowed based on rate limiting rules.
    Raises HTTPException if rate limit exceeded.
    """
    # Get client IP address
    client_ip = request.client.host if request.client else "unknown"

    # Get rate limit config for this endpoint
    if endpoint not in RATE_LIMITS:
        return  # No rate limit configured

    config = RATE_LIMITS[endpoint]
    max_requests = config["requests"]
    window_minutes = config["window_minutes"]

    # Initialize IP entry if not exists
    if client_ip not in request_log:
        request_log[client_ip] = []

    # Get current time
    now = datetime.now(timezone.utc)
    cutoff_time = now - timedelta(minutes=window_minutes)

    # Remove old entries outside the time window
    request_log[client_ip] = [
        (timestamp, ep) for timestamp, ep in request_log[client_ip]
        if timestamp > cutoff_time
    ]

    # Count requests to this endpoint in the time window
    endpoint_requests = sum(
        1 for _, ep in request_log[client_ip] if ep == endpoint
    )

    # Check if rate limit exceeded
    if endpoint_requests >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Please try again in {window_minutes} minutes.",
            headers={"Retry-After": str(window_minutes * 60)},
        )

    # Log this request
    request_log[client_ip].append((now, endpoint))


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
