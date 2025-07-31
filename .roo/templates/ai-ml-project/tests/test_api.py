import unittest
import pandas as pd
import numpy as np
import os
import sys
import tempfile
import json
from unittest.mock import patch, MagicMock

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

# Mock Flask app for testing
from api.app import create_app


class TestAPI(unittest.TestCase):
    def setUp(self):
        # Create test client
        self.app = create_app()
        self.client = self.app.test_client()
        
        # Sample data for testing
        self.sample_prediction_data = {
            'features': [1.0, 2.0, 3.0, 4.0]
        }
        
        self.sample_training_data = {
            'features': [
                [1.0, 2.0, 3.0, 4.0],
                [2.0, 3.0, 4.0, 5.0],
                [3.0, 4.0, 5.0, 6.0]
            ],
            'targets': [0, 1, 0]
        }
    
    def test_health_check(self):
        # Test health check endpoint
        response = self.client.get('/health')
        
        # Check if response is successful
        self.assertEqual(response.status_code, 200)
        
        # Check response data
        data = json.loads(response.data)
        self.assertIn('status', data)
        self.assertEqual(data['status'], 'healthy')
    
    def test_predict_valid_data(self):
        # Test prediction endpoint with valid data
        with patch('api.app.predict') as mock_predict:
            # Mock prediction result
            mock_predict.return_value = 1
            
            # Send POST request
            response = self.client.post(
                '/predict',
                data=json.dumps(self.sample_prediction_data),
                content_type='application/json'
            )
            
            # Check if response is successful
            self.assertEqual(response.status_code, 200)
            
            # Check response data
            data = json.loads(response.data)
            self.assertIn('prediction', data)
            self.assertEqual(data['prediction'], 1)
    
    def test_predict_invalid_data(self):
        # Test prediction endpoint with invalid data
        invalid_data = {
            'features': [1.0, 2.0]  # Missing features
        }
        
        response = self.client.post(
            '/predict',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        # Check if response is a client error
        self.assertEqual(response.status_code, 400)
    
    def test_predict_missing_data(self):
        # Test prediction endpoint with missing data
        response = self.client.post(
            '/predict',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        # Check if response is a client error
        self.assertEqual(response.status_code, 400)
    
    def test_train_valid_data(self):
        # Test training endpoint with valid data
        with patch('api.app.train_model') as mock_train:
            # Mock training result
            mock_train.return_value = {'status': 'success'}
            
            # Send POST request
            response = self.client.post(
                '/train',
                data=json.dumps(self.sample_training_data),
                content_type='application/json'
            )
            
            # Check if response is successful
            self.assertEqual(response.status_code, 200)
            
            # Check response data
            data = json.loads(response.data)
            self.assertIn('status', data)
            self.assertEqual(data['status'], 'success')
    
    def test_train_invalid_data(self):
        # Test training endpoint with invalid data
        invalid_data = {
            'features': [[1.0, 2.0, 3.0]],
            'targets': [0, 1]  # Mismatched lengths
        }
        
        response = self.client.post(
            '/train',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        # Check if response is a client error
        self.assertEqual(response.status_code, 400)
    
    def test_model_info(self):
        # Test model info endpoint
        with patch('api.app.get_model_info') as mock_info:
            # Mock model info
            mock_info.return_value = {
                'model_type': 'RandomForest',
                'version': '1.0.0',
                'training_date': '2023-01-01'
            }
            
            # Send GET request
            response = self.client.get('/model/info')
            
            # Check if response is successful
            self.assertEqual(response.status_code, 200)
            
            # Check response data
            data = json.loads(response.data)
            self.assertIn('model_type', data)
            self.assertIn('version', data)
            self.assertIn('training_date', data)


class TestAPIErrorHandling(unittest.TestCase):
    def setUp(self):
        # Create test client
        self.app = create_app()
        self.client = self.app.test_client()
    
    def test_404_error(self):
        # Test 404 error handling
        response = self.client.get('/nonexistent_endpoint')
        
        # Check if response is a not found error
        self.assertEqual(response.status_code, 404)
    
    def test_500_error(self):
        # Test 500 error handling
        with patch('api.app.health_check') as mock_health:
            # Mock exception
            mock_health.side_effect = Exception('Internal server error')
            
            # Send GET request
            response = self.client.get('/health')
            
            # Check if response is a server error
            self.assertEqual(response.status_code, 500)


def run_tests():
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases
    test_suite.addTest(unittest.makeSuite(TestAPI))
    test_suite.addTest(unittest.makeSuite(TestAPIErrorHandling))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result


if __name__ == '__main__':
    run_tests()