"""API package for the AI/ML project."""

from .models import HealthCheck, PredictionRequest, PredictionResponse, TrainRequest, TrainResponse, ModelInfo

__all__ = [
    "HealthCheck",
    "PredictionRequest",
    "PredictionResponse",
    "TrainRequest",
    "TrainResponse",
    "ModelInfo",
]