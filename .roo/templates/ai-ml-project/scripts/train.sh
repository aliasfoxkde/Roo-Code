#!/bin/bash

# Training script for AI/ML Project Template

# Exit on any error
set -e

# Print script usage
echo "AI/ML Project Template Training Script"
echo "==================================="
echo "This script will train the model using the configured parameters."
echo

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Warning: Virtual environment is not activated."
    echo "Please activate the virtual environment before running this script."
    echo "To activate: source venv/bin/activate"
    echo
done

# Activate virtual environment if it exists
if [ -f "venv/bin/activate" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Check if training data exists
if [ ! -d "data" ] || [ -z "$(ls -A data)" ]; then
    echo "Warning: No data found in the data directory."
    echo "Please download or generate training data before running this script."
    echo "You can use the data ingestion script: python src/data/ingestion.py"
    echo
done
fi

# Parse command line arguments
CONFIG_FILE="config/development.yaml"
MODEL_OUTPUT_DIR="models"

while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        -o|--output)
            MODEL_OUTPUT_DIR="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: train.sh [OPTIONS]"
            echo "Options:"
            echo "  -c, --config FILE    Configuration file to use (default: config/development.yaml)"
            echo "  -o, --output DIR     Output directory for trained models (default: models/)"
            echo "  -h, --help           Show this help message and exit"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information."
            exit 1
            ;;
    esac
done

# Print training configuration
echo "Training configuration:"
echo "  Config file: $CONFIG_FILE"
echo "  Output directory: $MODEL_OUTPUT_DIR"
echo

# Create output directory if it doesn't exist
mkdir -p "$MODEL_OUTPUT_DIR"

# Run training
echo "Starting model training..."
python src/models/training.py --config "$CONFIG_FILE" --output "$MODEL_OUTPUT_DIR"

# Check if training was successful
if [ $? -eq 0 ]; then
    echo
echo "Model training completed successfully!"
    echo "Trained model saved to: $MODEL_OUTPUT_DIR"
else
    echo
echo "Error: Model training failed."
    exit 1
fi

echo
echo "Training script finished."
