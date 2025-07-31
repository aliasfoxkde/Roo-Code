import unittest
import pandas as pd
import numpy as np
import os
import sys
import tempfile

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from data.ingestion import load_data, save_data
from data.preprocessing import handle_missing_values, scale_features, encode_categorical


class TestDataIngestion(unittest.TestCase):
    def setUp(self):
        # Create sample data for testing
        self.sample_data = pd.DataFrame({
            'feature1': [1, 2, 3, 4, 5],
            'feature2': ['A', 'B', 'A', 'B', 'A'],
            'target': [0, 1, 0, 1, 0]
        })
        
        # Create temporary directory for testing
        self.temp_dir = tempfile.mkdtemp()
        self.test_file = os.path.join(self.temp_dir, 'test_data.csv')
        
    def tearDown(self):
        # Clean up temporary files
        if os.path.exists(self.test_file):
            os.remove(self.test_file)
        os.rmdir(self.temp_dir)
    
    def test_load_data(self):
        # Save sample data to CSV
        self.sample_data.to_csv(self.test_file, index=False)
        
        # Load data
        loaded_data = load_data(self.test_file)
        
        # Check if data was loaded correctly
        self.assertIsInstance(loaded_data, pd.DataFrame)
        self.assertEqual(loaded_data.shape, self.sample_data.shape)
        pd.testing.assert_frame_equal(loaded_data, self.sample_data)
    
    def test_save_data(self):
        # Save data to CSV
        save_data(self.sample_data, self.test_file)
        
        # Check if file was created
        self.assertTrue(os.path.exists(self.test_file))
        
        # Load data back and check if it's the same
        loaded_data = pd.read_csv(self.test_file)
        pd.testing.assert_frame_equal(loaded_data, self.sample_data)


class TestDataPreprocessing(unittest.TestCase):
    def setUp(self):
        self.sample_data = pd.DataFrame({
            'numeric_feature': [1, 2, np.nan, 4, 5],
            'categorical_feature': ['A', 'B', 'A', 'B', 'C'],
            'target': [0, 1, 0, 1, 0]
        })
    
    def test_handle_missing_values(self):
        # Test filling missing values with mean
        processed_data = handle_missing_values(self.sample_data, strategy='mean')
        
        # Check if missing values were filled
        self.assertFalse(processed_data.isnull().any().any())
        
        # Check if the filled value is the mean
        expected_mean = self.sample_data['numeric_feature'].mean()
        self.assertEqual(processed_data.loc[2, 'numeric_feature'], expected_mean)
    
    def test_scale_features(self):
        # Test feature scaling
        scaled_data = scale_features(self.sample_data[['numeric_feature']])
        
        # Check if scaling was applied
        self.assertAlmostEqual(scaled_data['numeric_feature'].mean(), 0, places=10)
        self.assertAlmostEqual(scaled_data['numeric_feature'].std(), 1, places=10)
    
    def test_encode_categorical(self):
        # Test categorical encoding
        encoded_data = encode_categorical(self.sample_data[['categorical_feature']])
        
        # Check if encoding was applied
        self.assertTrue(all(col.startswith('categorical_feature_') for col in encoded_data.columns))
        
        # Check if we have the right number of columns
        unique_values = self.sample_data['categorical_feature'].nunique()
        self.assertEqual(encoded_data.shape[1], unique_values)


def run_tests():
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases
    test_suite.addTest(unittest.makeSuite(TestDataIngestion))
    test_suite.addTest(unittest.makeSuite(TestDataPreprocessing))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result


if __name__ == '__main__':
    run_tests()