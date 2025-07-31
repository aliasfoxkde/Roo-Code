#!/usr/bin/env python3
"""
API data models.
"""

from typing import List, Optional
from pydantic import BaseModel


class HealthCheck(BaseModel):
    """Health check response model."""
    status: str
    message: str


class PredictionRequest(BaseModel):
    """Prediction request model."""
    data: List[List[float]]
    model_id: Optional[str] = None


class PredictionResponse(BaseModel):
    """Prediction response model."""
    prediction: List[int]
    probabilities: List[List[float]]
    model_version: str


class TrainRequest(BaseModel):
    """Training request model."""
    dataset_path: str
    model_type: str
    hyperparameters: Optional[dict] = None
    validation_split: Optional[float] = 0.2


class TrainResponse(BaseModel):
    """Training response model."""
    status: str
    model_id: str
    model_version: str
    metrics: dict


class ModelInfo(BaseModel):
    """Model information model."""
    model_id: str
    model_version: str
    model_type: str
    created_at: str
    metrics: dict
    hyperparameters: dict