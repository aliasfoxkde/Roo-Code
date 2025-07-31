"""Tests for the Model class."""

import numpy as np
import pytest
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

from src.model import Model


class TestModel:
    """Test suite for the Model class."""
    
    @pytest.fixture
    def sample_data(self):
        """Create sample data for testing."""
        X, y = make_classification(
            n_samples=100,
            n_features=4,
            n_classes=2,
            random_state=42
        )
        return train_test_split(X, y, test_size=0.2, random_state=42)
    
    @pytest.fixture
    def model(self):
        """Create a Model instance for testing."""
        return Model(model_type='random_forest')
    
    def test_init(self, model):
        """Test Model initialization."""
        assert isinstance(model, Model)
        assert model.model_type == 'random_forest'
        assert model.config == {}
        assert model.is_trained is False
    
    def test_init_with_config(self):
        """Test Model initialization with custom config."""
        config = {'n_estimators': 50, 'random_state': 123}
        model = Model(model_type='random_forest', config=config)
        
        assert model.config == config
        assert model.model.n_estimators == 50
        assert model.model.random_state == 123
    
    def test_init_invalid_model_type(self):
        """Test Model initialization with invalid model type."""
        with pytest.raises(ValueError):
            Model(model_type='invalid_model')
    
    def test_train(self, sample_data, model):
        """Test model training."""
        X_train, X_test, y_train, y_test = sample_data
        
        # Train the model
        model.train(X_train, y_train)
        
        assert model.is_trained is True
    
    def test_predict_before_training(self, sample_data, model):
        """Test prediction before training raises error."""
        X_train, X_test, y_train, y_test = sample_data
        
        with pytest.raises(ValueError):
            model.predict(X_test)
    
    def test_predict_after_training(self, sample_data, model):
        """Test prediction after training."""
        X_train, X_test, y_train, y_test = sample_data
        
        # Train the model
        model.train(X_train, y_train)
        
        # Make predictions
        predictions = model.predict(X_test)
        
        assert isinstance(predictions, np.ndarray)
        assert len(predictions) == len(X_test)
        # Check that predictions are binary (0 or 1)
        assert set(np.unique(predictions)).issubset({0, 1})
    
    def test_predict_proba_before_training(self, sample_data, model):
        """Test probability prediction before training raises error."""
        X_train, X_test, y_train, y_test = sample_data
        
        with pytest.raises(ValueError):
            model.predict_proba(X_test)
    
    def test_predict_proba_after_training(self, sample_data, model):
        """Test probability prediction after training."""
        X_train, X_test, y_train, y_test = sample_data
        
        # Train the model
        model.train(X_train, y_train)
        
        # Make probability predictions
        proba_predictions = model.predict_proba(X_test)
        
        assert isinstance(proba_predictions, np.ndarray)
        assert proba_predictions.shape[0] == len(X_test)
        assert proba_predictions.shape[1] == 2  # Binary classification
        
        # Check that probabilities sum to 1 for each sample
        assert np.allclose(proba_predictions.sum(axis=1), 1.0)
    
    def test_evaluate_before_training(self, sample_data, model):
        """Test evaluation before training raises error."""
        X_train, X_test, y_train, y_test = sample_data
        
        with pytest.raises(ValueError):
            model.evaluate(X_test, y_test)
    
    def test_evaluate_after_training(self, sample_data, model):
        """Test model evaluation after training."""
        X_train, X_test, y_train, y_test = sample_data
        
        # Train the model
        model.train(X_train, y_train)
        
        # Evaluate the model
        metrics = model.evaluate(X_test, y_test)
        
        assert isinstance(metrics, dict)
        assert 'accuracy' in metrics
        assert 'precision' in metrics
        assert 'recall' in metrics
        assert 'f1' in metrics
        
        # Check that metrics are in valid range
        for metric_name, value in metrics.items():
            assert 0 <= value <= 1, f"{metric_name} should be between 0 and 1"
    
    def test_cross_validate_before_training(self, sample_data, model):
        """Test cross-validation before training raises error."""
        X_train, X_test, y_train, y_test = sample_data
        
        with pytest.raises(ValueError):
            model.cross_validate(X_train, y_train)
    
    def test_cross_validate_after_training(self, sample_data, model):
        """Test cross-validation after training."""
        X_train, X_test, y_train, y_test = sample_data
        
        # Train the model
        model.train(X_train, y_train)
        
        # Perform cross-validation
        cv_metrics = model.cross_validate(X_train, y_train, cv=3)
        
        assert isinstance(cv_metrics, dict)
        assert 'mean_accuracy' in cv_metrics
        assert 'std_accuracy' in cv_metrics
        assert 'scores' in cv_metrics
        
        scores = cv_metrics['scores']
        assert len(scores) == 3  # 3-fold CV
        assert all(0 <= score <= 1 for score in scores)
    
    def test_save_model_before_training(self, tmp_path, model):
        """Test saving model before training raises error."""
        model_path = tmp_path / "models"
        
        with pytest.raises(ValueError):
            model.save_model(str(model_path))
    
    def test_save_and_load_model(self, sample_data, tmp_path, model):
        """Test saving and loading a trained model."""
        X_train, X_test, y_train, y_test = sample_data
        
        # Train the model
        model.train(X_train, y_train)
        
        # Save the model
        model_path = tmp_path / "models"
        model_name = "test_model"
        model.save_model(str(model_path), model_name)
        
        # Check that model file exists
        model_file = model_path / f"{model_name}.pkl"
        assert model_file.exists()
        
        # Load the model
        loaded_model = Model(model_type='random_forest')
        loaded_model.load_model(str(model_path), model_name)
        
        assert loaded_model.is_trained is True
        
        # Check that loaded model makes same predictions
        original_predictions = model.predict(X_test)
        loaded_predictions = loaded_model.predict(X_test)
        
        assert np.array_equal(original_predictions, loaded_predictions)