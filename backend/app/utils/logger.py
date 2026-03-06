import logging
import sys
from app.config import get_settings

settings = get_settings()

def setup_logging():
    """
    Configures logging based on environment.
    In production, logs are set to INFO to avoid DEBUG noise and potential data leaks.
    """
    log_level = logging.INFO if settings.ENV == "production" else logging.DEBUG
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        stream=sys.stdout
    )
    
    # Create specific logger for our app
    logger = logging.getLogger("musb-backend")
    logger.setLevel(log_level)
    
    return logger

# Singleton logger instance
logger = setup_logging()
