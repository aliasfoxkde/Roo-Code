"""Test configuration and fixtures for pytest."""

import sys
from pathlib import Path

import pytest

# Add src directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Set up test environment before each test."""
    # This fixture runs automatically before each test
    # You can add setup code here if needed
    pass


@pytest.fixture
def sample_config():
    """Sample configuration for testing."""
    return {
        "app": {
            "name": "Test AI/ML Project",
            "version": "1.0.0-test",
            "host": "127.0.0.1",
            "port": 8001,
            "debug": True
        },
        "model": {
            "type": "random_forest",
            "n_estimators": 10,
            "max_depth": 5,
            "test_size": 0.2,
            "random_state": 42
        },
        "data": {
            "input_path": "tests/data/input/",
            "output_path": "tests/data/output/",
            "processed_path": "tests/data/processed/",
            "temp_path": "tests/data/temp/"
        }
    }


@pytest.fixture
def mock_data():
    """Mock data for testing."""
    import pandas as pd
    import numpy as np
    
    # Create sample data
    data = {
        "feature_1": np.random.rand(100),
        "feature_2": np.random.rand(100),
        "feature_3": np.random.rand(100),
        "feature_4": np.random.rand(100),
        "target": np.random.randint(0, 2, 100)
    }
    
    return pd.DataFrame(data)


@pytest.fixture
def mock_model():
    """Mock model for testing."""
    from unittest.mock import Mock
    
    model = Mock()
    model.is_trained = True
    model.predict.return_value = [0, 1, 0, 1, 0]
    model.predict_proba.return_value = [
        [0.8, 0.2],
        [0.3, 0.7],
        [0.9, 0.1],
        [0.2, 0.8],
        [0.7, 0.3]
    ]
    
    return model