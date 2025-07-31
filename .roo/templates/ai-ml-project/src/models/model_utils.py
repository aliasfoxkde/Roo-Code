"""Model utilities for the AI/ML project."""

import joblib
import os
import logging

logger = logging.getLogger(__name__)


def save_model(model, model_path, model_name):
    """Save a trained model to disk."""
    # Create model directory if it doesn't exist
    os.makedirs(model_path, exist_ok=True)
    
    # Create full file path
    file_path = os.path.join(model_path, f"{model_name}.pkl")
    
    # Save model
    joblib.dump(model, file_path)
    logger.info(f"Model saved to {file_path}")


def load_model(model_path, model_name):
    """Load a trained model from disk."""
    # Create full file path
    file_path = os.path.join(model_path, f"{model_name}.pkl")
    
    # Check if model file exists
    if not os.path.exists(file_path):
    raise FileNotFoundError(f"Model file not found: {file_path}")
    
    # Load model
    model = joblib.load(file_path)
    logger.info(f"Model loaded from {file_path}")
    return model


def get_model_info(model):
    """Get information about a trained model."""
    info = {
        "model_type": type(model).__name__,
        "parameters": model.get_params() if hasattr(model, 'get_params') else {}
    }
    
    # Add model-specific information
    if hasattr(model, 'feature_importances_'):
        info["feature_importances"] = model.feature_importances_.tolist()
    
    if hasattr(model, 'coef_'):
        info["coefficients"] = model.coef_.tolist()
    
    return info