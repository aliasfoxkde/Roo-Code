"""Tests for the DataProcessor class."""

import numpy as np
import pandas as pd
import pytest
from sklearn.datasets import make_classification

from src.data_processor import DataProcessor


class TestDataProcessor:
    """Test suite for the DataProcessor class."""
    
    @pytest.fixture
    def sample_data(self):
        """Create sample data for testing."""
        X, y = make_classification(
            n_samples=100,
            n_features=4,
            n_classes=2,
            random_state=42
        )
        df = pd.DataFrame(X, columns=[f"feature_{i}" for i in range(4)])
        df["target"] = y
        return df
    
    @pytest.fixture
    def data_processor(self):
        """Create a DataProcessor instance for testing."""
        return DataProcessor()
    
    def test_init(self, data_processor):
        """Test DataProcessor initialization."""
        assert isinstance(data_processor, DataProcessor)
        assert data_processor.config == {}
    
    def test_load_data_csv(self, tmp_path):
        """Test loading data from CSV file."""
        # Create sample CSV file
        csv_file = tmp_path / "sample.csv"
        df = pd.DataFrame({
            "feature_1": [1, 2, 3],
            "feature_2": [4, 5, 6],
            "target": [0, 1, 0]
        })
        df.to_csv(csv_file, index=False)
        
        # Test loading
        processor = DataProcessor()
        loaded_df = processor.load_data(str(csv_file))
        
        assert isinstance(loaded_df, pd.DataFrame)
        assert loaded_df.shape == (3, 3)
        assert list(loaded_df.columns) == ["feature_1", "feature_2", "target"]
    
    def test_handle_missing_values_mean(self, sample_data):
        """Test handling missing values with mean strategy."""
        # Introduce missing values
        sample_data.loc[0, "feature_0"] = np.nan
        sample_data.loc[1, "feature_1"] = np.nan
        
        processor = DataProcessor()
        cleaned_df = processor.handle_missing_values(sample_data, strategy="mean")
        
        assert cleaned_df.isnull().sum().sum() == 0
        assert cleaned_df.shape == sample_data.shape
    
    def test_handle_missing_values_drop(self, sample_data):
        """Test handling missing values with drop strategy."""
        # Introduce missing values
        sample_data.loc[0, "feature_0"] = np.nan
        sample_data.loc[1, "feature_1"] = np.nan
        
        processor = DataProcessor()
        cleaned_df = processor.handle_missing_values(sample_data, strategy="drop")
        
        assert cleaned_df.isnull().sum().sum() == 0
        assert cleaned_df.shape[0] < sample_data.shape[0]
    
    def test_encode_categorical_features(self, sample_data):
        """Test encoding categorical features."""
        # Add a categorical column
        sample_data["category"] = ["A", "B", "C"] * (len(sample_data) // 3)
        
        processor = DataProcessor()
        encoded_df = processor.encode_categorical_features(sample_data, columns=["category"])
        
        assert "category" in encoded_df.columns
        assert encoded_df["category"].dtype in [np.int64, np.int32]
    
    def test_scale_features(self, sample_data):
        """Test scaling features."""
        # Separate features from target
        X = sample_data.drop(columns=["target"])
        y = sample_data["target"]
        
        processor = DataProcessor()
        X_scaled = processor.scale_features(X, fit=True)
        
        # Check that scaled features have mean ~0 and std ~1
        assert np.allclose(X_scaled.mean(axis=0), 0, atol=1e-10)
        assert np.allclose(X_scaled.std(axis=0), 1, atol=1e-10)
    
    def test_split_data(self, sample_data):
        """Test splitting data into train and test sets."""
        # Separate features from target
        X = sample_data.drop(columns=["target"])
        y = sample_data["target"]
        
        processor = DataProcessor()
        X_train, X_test, y_train, y_test = processor.split_data(X, y, test_size=0.2)
        
        # Check shapes
        assert X_train.shape[0] == int(0.8 * len(X))
        assert X_test.shape[0] == int(0.2 * len(X))
        assert y_train.shape[0] == int(0.8 * len(y))
        assert y_test.shape[0] == int(0.2 * len(y))
        
        # Check that all features are preserved
        assert X_train.shape[1] == X_test.shape[1] == X.shape[1]
    
    def test_process_pipeline(self, sample_data):
        """Test the complete data processing pipeline."""
        processor = DataProcessor()
        X_train, X_test, y_train, y_test = processor.process_pipeline(
            sample_data, target_column="target", test_size=0.2
        )
        
        # Check that we get the expected output format
        assert isinstance(X_train, np.ndarray)
        assert isinstance(X_test, np.ndarray)
        assert isinstance(y_train, (np.ndarray, pd.Series))
        assert isinstance(y_test, (np.ndarray, pd.Series))
        
        # Check shapes
        total_samples = len(sample_data)
        train_samples = int(0.8 * total_samples)
        test_samples = total_samples - train_samples
        
        assert X_train.shape[0] == train_samples
        assert X_test.shape[0] == test_samples
        assert len(y_train) == train_samples
        assert len(y_test) == test_samples