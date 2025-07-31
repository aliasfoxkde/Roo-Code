#!/usr/bin/env python3
"""
Main entry point for the AI/ML Project Template.
"""

import logging
import os
import sys
from pathlib import Path

import uvicorn
import yaml

# Add the src directory to the path
sys.path.append(str(Path(__file__).parent))

from src.api.main import app
from src.utils.config import load_config
from src.utils.logger import setup_logger


def main():
    """Main function."""
    # Setup logging
    logger = setup_logger(__name__, level="INFO")
    
    # Load configuration
    config_path = os.environ.get("CONFIG_PATH", "config/config.yaml")
    logger.info("Loading configuration from %s", config_path)
    config = load_config(config_path)
    
    # Start the API server
    logger.info("Starting API server on %s:%s", 
                config["app"]["host"], config["app"]["port"])
    
    uvicorn.run(
        "src.api.main:app",
        host=config["app"]["host"],
        port=config["app"]["port"],
        log_level=config["logging"]["level"].lower(),
        reload=config["development"]["reload"],
        reload_dirs=config["development"]["reload_dirs"],
        reload_excludes=config["development"]["reload_excludes"]
    )


if __name__ == "__main__":
    main()