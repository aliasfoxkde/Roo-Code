"""AI/ML Project Template - Data Processing Module

This module provides utilities for data processing and preprocessing.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import logging


# Configure logging
logger = logging.getLogger(__name__)


class DataProcessor:
    """Data processing class for ML projects."""
    
    def __init__(self, config=None):
        """Initialize data processor."""
        self.config = config or {}
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
    def load_data(self, file_path):
        """Load data from file."""
        logger.info(f"Loading data from {file_path}")
        # Support different file formats
        if file_path.endswith('.csv'):
            return pd.read_csv(file_path)
        elif file_path.endswith('.parquet'):
            return pd.read_parquet(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_path}")
    
    def handle_missing_values(self, df, strategy='mean'):
        """Handle missing values in dataframe."""
        logger.info(f"Handling missing values with strategy: {strategy}")
        df_clean = df.copy()
        
        if strategy == 'mean':
            # Fill numerical columns with mean
            numerical_cols = df_clean.select_dtypes(include=[np.number]).columns
            df_clean[numerical_cols] = df_clean[numerical_cols].fillna(
                df_clean[numerical_cols].mean()
            )
            
            # Fill categorical columns with mode
            categorical_cols = df_clean.select_dtypes(include=['object']).columns
            for col in categorical_cols:
                df_clean[col] = df_clean[col].fillna(df_clean[col].mode()[0])
                
        elif strategy == 'drop':
            df_clean = df_clean.dropna()
            
        return df_clean
    
    def encode_categorical_features(self, df, columns=None):
        """Encode categorical features."""
        logger.info("Encoding categorical features")
        df_encoded = df.copy()
        
        if columns is None:
            columns = df_encoded.select_dtypes(include=['object']).columns
            
        for col in columns:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                df_encoded[col] = self.label_encoders[col].fit_transform(df_encoded[col])
            else:
                df_encoded[col] = self.label_encoders[col].transform(df_encoded[col])
                
        return df_encoded
    
    def scale_features(self, X, fit=True):
        """Scale features using standard scaler."""
        logger.info("Scaling features")
        if fit:
            return self.scaler.fit_transform(X)
        else:
            return self.scaler.transform(X)
    
    def split_data(self, X, y, test_size=0.2, random_state=42):
        """Split data into train and test sets."""
        logger.info(f"Splitting data with test size: {test_size}")
        return train_test_split(X, y, test_size=test_size, random_state=random_state)
    
    def process_pipeline(self, df, target_column, test_size=0.2):
        """Complete data processing pipeline."""
        logger.info("Running complete data processing pipeline")
        
        # Handle missing values
        df_clean = self.handle_missing_values(df)
        
        # Separate features and target
        X = df_clean.drop(columns=[target_column])
        y = df_clean[target_column]
        
        # Encode categorical features
        X = self.encode_categorical_features(X)
        y = self.encode_categorical_features(y.to_frame(), columns=[target_column])[target_column]
        
        # Split data
        X_train, X_test, y_train, y_test = self.split_data(X, y, test_size)
        
        # Scale features
        X_train_scaled = self.scale_features(X_train, fit=True)
        X_test_scaled = self.scale_features(X_test, fit=False)
        
        return X_train_scaled, X_test_scaled, y_train, y_test