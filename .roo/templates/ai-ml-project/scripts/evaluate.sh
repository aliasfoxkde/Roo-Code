#!/bin/bash

# Evaluation script for AI/ML Project Template

# Exit on any error
set -e

# Print script usage
echo "AI/ML Project Template Evaluation Script"
echo "====================================="
echo "This script will evaluate the trained model using test data."
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

# Check if test data exists
if [ ! -d "data" ] || [ -z "$(ls -A data)" ]; then
    echo "Warning: No data found in the data directory."
    echo "Please download or generate test data before running this script."
    echo "You can use the data ingestion script: python src/data/ingestion.py"
    echo
done
fi

# Parse command line arguments
CONFIG_FILE="config/development.yaml"
MODEL_PATH="models"
EVAL_OUTPUT_DIR="evaluation"

while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        -m|--model)
            MODEL_PATH="$2"
            shift 2
            ;;
        -o|--output)
            EVAL_OUTPUT_DIR="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: evaluate.sh [OPTIONS]"
            echo "Options:"
            echo "  -c, --config FILE    Configuration file to use (default: config/development.yaml)"
            echo "  -m, --model PATH     Path to trained model (default: models/)"
            echo "  -o, --output DIR     Output directory for evaluation results (default: evaluation/)"
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

# Print evaluation configuration
echo "Evaluation configuration:"
echo "  Config file: $CONFIG_FILE"
echo "  Model path: $MODEL_PATH"
echo "  Output directory: $EVAL_OUTPUT_DIR"
echo

# Create output directory if it doesn't exist
mkdir -p "$EVAL_OUTPUT_DIR"

# Run evaluation
echo "Starting model evaluation..."
python src/models/evaluation.py --config "$CONFIG_FILE" --model "$MODEL_PATH" --output "$EVAL_OUTPUT_DIR"

# Check if evaluation was successful
if [ $? -eq 0 ]; then
    echo
echo "Model evaluation completed successfully!"
    echo "Evaluation results saved to: $EVAL_OUTPUT_DIR"
else
    echo
echo "Error: Model evaluation failed."
    exit 1
fi

echo
echo "Evaluation script finished."
