#!/usr/bin/env python3
"""
Serve AI/ML Model via API

This script serves a trained model via a Flask API.
"""

import os
import sys
import argparse
from pathlib import Path
import yaml

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from api.app import create_app


def load_config(config_path):
    """Load configuration from YAML file."""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


def main():
    parser = argparse.ArgumentParser(description="Serve AI/ML model via API")
    parser.add_argument("--config", "-c", default="config/development.yaml",
                        help="Path to configuration file")
    parser.add_argument("--host", "-H", default="0.0.0.0",
                        help="Host to bind the server to")
    parser.add_argument("--port", "-p", type=int, default=8000,
                        help="Port to bind the server to")
    parser.add_argument("--debug", "-d", action="store_true",
                        help="Enable debug mode")
    args = parser.parse_args()
    
    # Load configuration
    config = load_config(args.config)
    
    # Get API configuration
    api_config = config.get("api", {})
    
    # Use command line arguments if provided, otherwise use config
    host = args.host if args.host else api_config.get("host", "0.0.0.0")
    port = args.port if args.port else api_config.get("port", 8000)
    debug = args.debug if args.debug else api_config.get("debug", False)
    
    # Create and run the Flask app
    app = create_app(config)
    
    print(f"Starting API server on {host}:{port}")
    if debug:
        print("Debug mode enabled")
    
    app.run(host=host, port=port, debug=debug)


if __name__ == "__main__":
    main()
