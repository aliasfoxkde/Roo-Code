#!/usr/bin/env python3
"""
Train AI/ML Model

This script trains a model using the project's training pipeline.
"""

import os
import sys
import argparse
from pathlib import Path
import yaml

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from models.training import train_model
from models.evaluation import evaluate_model
from data.ingestion import load_data
from data.preprocessing import preprocess_data


def load_config(config_path):
    """Load configuration from YAML file."""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


def main():
    parser = argparse.ArgumentParser(description="Train AI/ML model")
    parser.add_argument("--config", "-c", default="config/development.yaml",
                        help="Path to configuration file")
    parser.add_argument("--data", "-d", help="Path to training data file")
    parser.add_argument("--model-type", "-m", default="random_forest",
                        choices=["random_forest", "logistic_regression", "xgboost"],
                        help="Type of model to train")
    parser.add_argument("--output", "-o", help="Output path for trained model")
    args = parser.parse_args()
    
    # Load configuration
    config = load_config(args.config)
    
    # Load data
    if args.data:
        data_path = args.data
    else:
        data_path = config.get("data", {}).get("raw_path", "data/raw/")
    
    print(f"Loading data from {data_path}")
    # Assuming the data is in CSV format
    import pandas as pd
    data = pd.read_csv(data_path)
    
    # Separate features and target
    # This assumes the target column is named 'target'
    # You may need to adjust this based on your data
    if 'target' in data.columns:
        X = data.drop('target', axis=1)
        y = data['target']
    else:
        print("Warning: No 'target' column found. Using last column as target.")
        X = data.iloc[:, :-1]
        y = data.iloc[:, -1]
    
    # Preprocess data
    print("Preprocessing data...")
    X_processed = preprocess_data(X)
    
    # Get training configuration
    training_config = config.get("training", {})
    
    # Train model
    print(f"Training {args.model_type} model...")
    model = train_model(
        X_processed, y,
        model_type=args.model_type,
        **training_config
    )
    
    # Evaluate model
    print("Evaluating model...")
    metrics = evaluate_model(model, X_processed, y)
    
    # Print metrics
    print("\nModel Performance Metrics:")
    print("=" * 30)
    for metric, value in metrics.items():
        print(f"{metric}: {value:.4f}")
    
    # Save model
    if args.output:
        model_path = args.output
    else:
        model_path = config.get("model", {}).get("path", "models/")
    
    # Ensure model directory exists
    Path(model_path).mkdir(parents=True, exist_ok=True)
    
    # Save model using joblib
    import joblib
    model_file = os.path.join(model_path, f"{args.model_type}_model.pkl")
    joblib.dump(model, model_file)
    print(f"\nModel saved to {model_file}")
    
    print("\nTraining completed successfully!")


if __name__ == "__main__":
    main()
