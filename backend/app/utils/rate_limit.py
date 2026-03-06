from datetime import datetime, timezone, timedelta
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status
import time

# In-memory store: {ip_address: [(timestamp, endpoint), ...]}
# Using float timestamp for precision and memory efficiency
request_log: Dict[str, List[Tuple[float, str]]] = {}

# Rate limit configuration (requests per time window)
RATE_LIMITS = {
    "/api/auth/login": {"requests": 5, "window_minutes": 15},  # 5 attempts per 15 min
    "/api/auth/register": {"requests": 3, "window_minutes": 60},  # 3 attempts per hour
    "/api/auth/verify/send": {"requests": 5, "window_minutes": 60},  # 5 OTPs per hour
    "/api/auth/verify/check": {"requests": 10, "window_minutes": 15},  # 10 checks per 15 min
}


async def rate_limit_check(request: Request, endpoint: str) -> None:
    """
    Robust sliding window rate limiting.
    Rejects requests if they exceed limits set in RATE_LIMITS.
    """
    # Get client IP (handle proxies)
    ip = request.headers.get("X-Forwarded-For") or request.client.host
    if not ip:
        return  # Should not happen in proper setup

    now = time.time()
    
    # Get config for this endpoint
    config = RATE_LIMITS.get(endpoint, {"requests": 100, "window_minutes": 1})
    window_seconds = config["window_minutes"] * 60
    max_requests = config["requests"]

    # Initialize log for this IP if not exists
    if ip not in request_log:
        request_log[ip] = []

    # Cleanup old requests for this IP and endpoint to create the sliding window
    # Filter for the specific endpoint and within the window
    cutoff = now - window_seconds
    
    # We keep other endpoint logs but filter current one
    current_endpoint_logs = [t for t, ep in request_log[ip] if ep == endpoint and t > cutoff]
    
    if len(current_endpoint_logs) >= max_requests:
        # Calculate when the next request will be allowed
        earliest_request_time = current_endpoint_logs[0]
        retry_after = int(earliest_request_time + window_seconds - now)
        
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many attempts. Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )

    # Add current request to log
    request_log[ip].append((now, endpoint))
    
    # Periodically cleanup the entire ip log (e.g. if > 100 entries)
    if len(request_log[ip]) > 100:
         request_log[ip] = [(t, ep) for t, ep in request_log[ip] if t > (now - 3600)] # Keep only last hour of everything
