"""
Logging configuration for the IRIS AI Risk Engine
"""
import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

from app.core.config import settings

def setup_logging():
    """Configure logging for the application"""
    log_format = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Get root logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, settings.LOG_LEVEL))
    
    # Clear existing handlers
    if logger.handlers:
        logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)
    
    # File handler (rotated logs)
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    file_handler = RotatingFileHandler(
        logs_dir / "iris_risk_engine.log",
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(log_format)
    logger.addHandler(file_handler)
    
    # Create additional named loggers
    loggers = {
        "api": logging.getLogger("api"),
        "data": logging.getLogger("data"),
        "model": logging.getLogger("model"),
        "llm": logging.getLogger("llm"),
    }
    
    return logger