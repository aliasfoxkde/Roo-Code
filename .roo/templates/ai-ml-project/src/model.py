"""AI/ML Project Template - Model Module

This module provides utilities for model training and evaluation.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import cross_val_score
import joblib
import logging


# Configure logging
logger = logging.getLogger(__name__)


class Model:
    """Base model class for ML projects."""
    
    def __init__(self, model_type='random_forest', config=None):
        """Initialize model."""
        self.config = config or {}
        self.model_type = model_type
        self.model = None
        self.is_trained = False
        
        # Initialize model based on type
        if model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=self.config.get('n_estimators', 100),
                random_state=self.config.get('random_state', 42),
                n_jobs=self.config.get('n_jobs', -1)
            )
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
    
    def train(self, X_train, y_train):
        """Train the model."""
        logger.info(f"Training {self.model_type} model")
        self.model.fit(X_train, y_train)
        self.is_trained = True
        logger.info("Model training completed")
        
    def predict(self, X):
        """Make predictions using the trained model."""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
            
        logger.info("Making predictions")
        return self.model.predict(X)
    
    def predict_proba(self, X):
        """Make probability predictions using the trained model."""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
            
        logger.info("Making probability predictions")
        return self.model.predict_proba(X)
    
    def evaluate(self, X_test, y_test):
        """Evaluate the model."""
        if not self.is_trained:
            raise ValueError("Model must be trained before evaluation")
            
        logger.info("Evaluating model")
        y_pred = self.predict(X_test)
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted'),
            'recall': recall_score(y_test, y_pred, average='weighted'),
            'f1': f1_score(y_test, y_pred, average='weighted')
        }
        
        logger.info(f"Evaluation metrics: {metrics}")
        return metrics
    
    def cross_validate(self, X, y, cv=5):
        """Perform cross-validation."""
        if not self.is_trained:
            raise ValueError("Model must be trained before cross-validation")
            
        logger.info(f"Performing {cv}-fold cross-validation")
        scores = cross_val_score(self.model, X, y, cv=cv, scoring='accuracy')
        
        cv_metrics = {
            'mean_accuracy': np.mean(scores),
            'std_accuracy': np.std(scores),
            'scores': scores.tolist()
        }
        
        logger.info(f"Cross-validation metrics: {cv_metrics}")
        return cv_metrics
    
    def save_model(self, file_path):
        """Save the trained model."""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
            
        logger.info(f"Saving model to {file_path}")
        joblib.dump(self.model, file_path)
        
    def load_model(self, file_path):
        """Load a trained model."""
        logger.info(f"Loading model from {file_path}")
        self.model = joblib.load(file_path)
        self.is_trained = True