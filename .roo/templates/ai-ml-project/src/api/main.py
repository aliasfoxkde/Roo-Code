#!/usr/bin/env python3
"""
Main API application module.
"""

import logging
from typing import Dict, Any

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from src.api.models import HealthCheck, PredictionRequest, PredictionResponse, TrainRequest
from src.utils.logger import setup_logger


# Setup logging
logger = setup_logger(__name__, level="INFO")

# Initialize FastAPI app
app = FastAPI(
    title="AI/ML Project Template API",
    description="API for AI/ML Project Template",
    version="1.0.0"
)

# Global model variable
model = None


class ModelNotLoadedException(Exception):
    """Exception raised when model is not loaded."""
    pass


@app.on_event("startup")
async def startup_event():
    """Load model on startup."""
    global model
    try:
        # Load a default model if available
        # model = joblib.load("models/default_model.pkl")
        logger.info("API started successfully")
    except Exception as e:
        logger.warning("Failed to load default model: %s", str(e))


@app.get("/", response_model=HealthCheck)
async def health_check():
    """Health check endpoint."""
    return HealthCheck(status="OK", message="API is running")


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Make predictions using a trained model."""
    global model
    
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Convert input data to numpy array
        input_data = np.array(request.data)
        
        # Make prediction
        prediction = model.predict(input_data)
        probabilities = model.predict_proba(input_data)
        
        return PredictionResponse(
            prediction=prediction.tolist(),
            probabilities=probabilities.tolist(),
            model_version="1.0.0"
        )
    except Exception as e:
        logger.error("Prediction failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/train")
async def train_model(request: TrainRequest):
    """Train a new model."""
    try:
        # This would call the training script
        # For now, we'll just log the request
        logger.info("Training request received: %s", request)
        
        # In a real implementation, you would:
        # 1. Load and preprocess the data
        # 2. Initialize the model
        # 3. Train the model
        # 4. Save the model
        # 5. Update the global model variable
        
        return {"status": "success", "message": "Model training started"}
    except Exception as e:
        logger.error("Training failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")