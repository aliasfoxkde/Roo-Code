#!/bin/bash

# Setup script for AI/ML Project Template

# Exit on any error
set -e

# Print script usage
echo "AI/ML Project Template Setup Script"
echo "==============================="
echo "This script will set up your development environment for the AI/ML project."
echo

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed. Please install pip3 and try again."
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip3 install --upgrade pip

# Install development dependencies
echo "Installing development dependencies..."
pip3 install -r requirements/development.txt

# Install the package in development mode
echo "Installing package in development mode..."
pip3 install -e .

# Set up pre-commit hooks
echo "Setting up pre-commit hooks..."
pre-commit install

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p data models logs output notebooks

# Download sample data (if needed)
# echo "Downloading sample data..."
# python3 src/data/ingestion.py

# Run tests to verify setup
echo "Running tests to verify setup..."
python3 -m pytest tests/ -v

# Print success message
echo
echo "Setup completed successfully!"
echo "To activate the virtual environment, run: source venv/bin/activate"
echo "To start Jupyter notebook, run: make jupyter"
echo "To run tests, run: make test"
echo "To see all available commands, run: make help"

# Deactivate virtual environment
deactivate

echo
echo "Setup script finished."
