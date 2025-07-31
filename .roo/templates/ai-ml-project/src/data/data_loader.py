"""Data loading utilities for the AI/ML project."""

import pandas as pd
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)


def load_data(data_path):
    """Load data from various file formats."""
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data path not found: {data_path}")
    
    # If data_path is a directory, look for common data files
    if os.path.isdir(data_path):
        # Look for common data files
        for filename in os.listdir(data_path):
            if filename.endswith(('.csv', '.parquet', '.json')):
                file_path = os.path.join(data_path, filename)
                logger.info(f"Loading data from {file_path}")
                return _load_file(file_path)
        raise FileNotFoundError(f"No data files found in directory: {data_path}")
    else:
        # data_path is a file
        logger.info(f"Loading data from {data_path}")
        return _load_file(data_path)


def _load_file(file_path):
    """Load data from a specific file."""
    if file_path.endswith('.csv'):
        return pd.read_csv(file_path)
    elif file_path.endswith('.parquet'):
        return pd.read_parquet(file_path)
    elif file_path.endswith('.json'):
        return pd.read_json(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_path}")


def save_data(df, file_path):
    """Save data to various file formats."""
    logger.info(f"Saving data to {file_path}")
    
    if file_path.endswith('.csv'):
        df.to_csv(file_path, index=False)
    elif file_path.endswith('.parquet'):
        df.to_parquet(file_path, index=False)
    elif file_path.endswith('.json'):
        df.to_json(file_path, orient='records')
    else:
        raise ValueError(f"Unsupported file format: {file_path}")