#!/bin/bash

# Cleanup script for AI/ML Project Template

# Exit on any error
set -e

# Print script usage
echo "AI/ML Project Template Cleanup Script"
echo "===================================="
echo "This script will clean up temporary files and directories."
echo

# Parse command line arguments
CLEAN_DATA=false
CLEAN_MODELS=false
CLEAN_LOGS=false
CLEAN_OUTPUT=false
CLEAN_VENV=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --data)
            CLEAN_DATA=true
            shift
            ;;
        --models)
            CLEAN_MODELS=true
            shift
            ;;
        --logs)
            CLEAN_LOGS=true
            shift
            ;;
        --output)
            CLEAN_OUTPUT=true
            shift
            ;;
        --venv)
            CLEAN_VENV=true
            shift
            ;;
        --all)
            CLEAN_DATA=true
            CLEAN_MODELS=true
            CLEAN_LOGS=true
            CLEAN_OUTPUT=true
            CLEAN_VENV=true
            shift
            ;;
        -h|--help)
            echo "Usage: cleanup.sh [OPTIONS]"
            echo "Options:"
            echo "  --data      Clean data directory"
            echo "  --models    Clean models directory"
            echo "  --logs      Clean logs directory"
            echo "  --output    Clean output directory"
            echo "  --venv      Clean virtual environment"
            echo "  --all       Clean all temporary files and directories"
            echo "  -h, --help  Show this help message and exit"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information."
            exit 1
            ;;
    esac
done

# If no options are specified, show help
if [ "$CLEAN_DATA" = false ] && [ "$CLEAN_MODELS" = false ] && [ "$CLEAN_LOGS" = false ] && [ "$CLEAN_OUTPUT" = false ] && [ "$CLEAN_VENV" = false ]; then
    echo "No cleanup options specified. Use -h or --help for usage information."
    exit 1
fi

# Print cleanup configuration
echo "Cleanup configuration:"
if [ "$CLEAN_DATA" = true ]; then
    echo "  Cleaning data directory"
fi
if [ "$CLEAN_MODELS" = true ]; then
    echo "  Cleaning models directory"
fi
if [ "$CLEAN_LOGS" = true ]; then
    echo "  Cleaning logs directory"
fi
if [ "$CLEAN_OUTPUT" = true ]; then
    echo "  Cleaning output directory"
fi
if [ "$CLEAN_VENV" = true ]; then
    echo "  Cleaning virtual environment"
fi
echo

# Stop Docker containers if they are running
if command -v docker-compose &> /dev/null; then
    echo "Stopping Docker containers..."
    docker-compose down 2>/dev/null || true
fi

# Clean data directory
if [ "$CLEAN_DATA" = true ]; then
    if [ -d "data" ]; then
        echo "Cleaning data directory..."
        rm -rf data/*
    fi
fi

# Clean models directory
if [ "$CLEAN_MODELS" = true ]; then
    if [ -d "models" ]; then
        echo "Cleaning models directory..."
        rm -rf models/*
    fi
fi

# Clean logs directory
if [ "$CLEAN_LOGS" = true ]; then
    if [ -d "logs" ]; then
        echo "Cleaning logs directory..."
        rm -rf logs/*
    fi
fi

# Clean output directory
if [ "$CLEAN_OUTPUT" = true ]; then
    if [ -d "output" ]; then
        echo "Cleaning output directory..."
        rm -rf output/*
    fi
fi

# Clean virtual environment
if [ "$CLEAN_VENV" = true ]; then
    if [ -d "venv" ]; then
        echo "Cleaning virtual environment..."
        rm -rf venv/
    fi
fi

# Clean Python cache files
echo "Cleaning Python cache files..."
find . -type f -name "*.pyc" -delete
find . -type d -name "__pycache__" -delete
find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true

# Clean test coverage reports
if [ -f ".coverage" ]; then
    echo "Cleaning test coverage reports..."
    rm -f .coverage
fi

if [ -d "htmlcov" ]; then
    rm -rf htmlcov/
fi

# Clean build artifacts
if [ -d "build" ]; then
    echo "Cleaning build artifacts..."
    rm -rf build/
fi

if [ -d "dist" ]; then
    rm -rf dist/
fi

if ls *.egg-info 1> /dev/null 2>&1; then
    rm -rf *.egg-info
fi

# Print success message
echo
echo "Cleanup completed successfully!"

echo
echo "Cleanup script finished."
