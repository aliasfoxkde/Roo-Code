#!/bin/bash

# Deployment script for AI/ML Project Template

# Exit on any error
set -e

# Print script usage
echo "AI/ML Project Template Deployment Script"
echo "======================================="
echo "This script will deploy the trained model to a production environment."
echo

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Warning: Virtual environment is not activated."
    echo "Please activate the virtual environment before running this script."
    echo "To activate: source venv/bin/activate"
    echo
done
fi

# Activate virtual environment if it exists
if [ -f "venv/bin/activate" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Check if model exists
if [ ! -d "models" ] || [ -z "$(ls -A models)" ]; then
    echo "Error: No trained models found in the models directory."
    echo "Please train a model first using the train.sh script."
    exit 1
fi

# Parse command line arguments
ENVIRONMENT="production"
CONFIG_FILE="config/production.yaml"
MODEL_PATH="models"

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        -m|--model)
            MODEL_PATH="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: deploy.sh [OPTIONS]"
            echo "Options:"
            echo "  -e, --environment ENV  Deployment environment (default: production)"
            echo "  -c, --config FILE      Configuration file to use (default: config/production.yaml)"
            echo "  -m, --model PATH       Path to trained model (default: models/)"
            echo "  -h, --help             Show this help message and exit"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information."
            exit 1
            ;;
    esac
done

# Print deployment configuration
echo "Deployment configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Config file: $CONFIG_FILE"
echo "  Model path: $MODEL_PATH"
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Build Docker images
echo "Building Docker images..."
docker-compose build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Error: Docker image build failed."
    exit 1
fi

# Start Docker containers
echo "Starting Docker containers..."
docker-compose up -d

# Check if containers started successfully
if [ $? -ne 0 ]; then
    echo "Error: Failed to start Docker containers."
    exit 1
fi

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check service status
echo "Checking service status..."
docker-compose ps

# Print success message
echo
echo "Deployment completed successfully!"
echo "The application is now running in the $ENVIRONMENT environment."
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"

echo
echo "Deployment script finished."
