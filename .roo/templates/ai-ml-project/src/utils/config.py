"""Configuration utilities for the AI/ML project."""

import yaml
import os
import logging

logger = logging.getLogger(__name__)


def load_config(config_path):
    """Load configuration from a YAML file."""
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found: {config_path}")
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    logger.info(f"Configuration loaded from {config_path}")
    return config


def save_config(config, config_path):
    """Save configuration to a YAML file."""
    with open(config_path, 'w') as f:
        yaml.dump(config, f)
    
    logger.info(f"Configuration saved to {config_path}")