import unittest
import pandas as pd
import numpy as np
import os
import sys
import tempfile
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from models.training import train_model
from models.evaluation import evaluate_model


class TestModelTraining(unittest.TestCase):
    def setUp(self):
        # Create sample data for testing
        X, y = make_classification(n_samples=100, n_features=4, n_classes=2, random_state=42)
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Convert to DataFrame for easier handling
        feature_names = [f'feature_{i}' for i in range(X.shape[1])]
        self.X_train_df = pd.DataFrame(self.X_train, columns=feature_names)
        self.X_test_df = pd.DataFrame(self.X_test, columns=feature_names)
        self.y_train_series = pd.Series(self.y_train)
        self.y_test_series = pd.Series(self.y_test)
    
    def test_train_model_with_random_forest(self):
        # Test training with Random Forest
        model = train_model(
            self.X_train_df, self.y_train_series, 
            model_type='random_forest',
            n_estimators=10,
            random_state=42
        )
        
        # Check if model was created
        self.assertIsNotNone(model)
        
        # Check if model has the expected methods
        self.assertTrue(hasattr(model, 'predict'))
        self.assertTrue(hasattr(model, 'predict_proba'))
    
    def test_train_model_with_logistic_regression(self):
        # Test training with Logistic Regression
        model = train_model(
            self.X_train_df, self.y_train_series, 
            model_type='logistic_regression',
            random_state=42
        )
        
        # Check if model was created
        self.assertIsNotNone(model)
        
        # Check if model has the expected methods
        self.assertTrue(hasattr(model, 'predict'))
        self.assertTrue(hasattr(model, 'predict_proba'))
    
    def test_train_model_with_invalid_type(self):
        # Test training with invalid model type
        with self.assertRaises(ValueError):
            train_model(
                self.X_train_df, self.y_train_series, 
                model_type='invalid_model'
            )


class TestModelEvaluation(unittest.TestCase):
    def setUp(self):
        # Create sample data for testing
        X, y = make_classification(n_samples=100, n_features=4, n_classes=2, random_state=42)
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Convert to DataFrame for easier handling
        feature_names = [f'feature_{i}' for i in range(X.shape[1])]
        self.X_train_df = pd.DataFrame(self.X_train, columns=feature_names)
        self.X_test_df = pd.DataFrame(self.X_test, columns=feature_names)
        self.y_train_series = pd.Series(self.y_train)
        self.y_test_series = pd.Series(self.y_test)
        
        # Train a model for evaluation
        self.model = train_model(
            self.X_train_df, self.y_train_series, 
            model_type='random_forest',
            n_estimators=10,
            random_state=42
        )
    
    def test_evaluate_model(self):
        # Test model evaluation
        metrics = evaluate_model(
            self.model, self.X_test_df, self.y_test_series
        )
        
        # Check if metrics were calculated
        self.assertIsInstance(metrics, dict)
        self.assertIn('accuracy', metrics)
        self.assertIn('precision', metrics)
        self.assertIn('recall', metrics)
        self.assertIn('f1_score', metrics)
        
        # Check if metric values are in valid range
        self.assertGreaterEqual(metrics['accuracy'], 0.0)
        self.assertLessEqual(metrics['accuracy'], 1.0)
        
        self.assertGreaterEqual(metrics['precision'], 0.0)
        self.assertLessEqual(metrics['precision'], 1.0)
        
        self.assertGreaterEqual(metrics['recall'], 0.0)
        self.assertLessEqual(metrics['recall'], 1.0)
        
        self.assertGreaterEqual(metrics['f1_score'], 0.0)
        self.assertLessEqual(metrics['f1_score'], 1.0)
    
    def test_evaluate_model_with_invalid_data(self):
        # Test evaluation with mismatched data
        with self.assertRaises(ValueError):
            evaluate_model(
                self.model, 
                self.X_test_df.iloc[:, :2],  # Only first 2 features
                self.y_test_series
            )


def run_tests():
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases
    test_suite.addTest(unittest.makeSuite(TestModelTraining))
    test_suite.addTest(unittest.makeSuite(TestModelEvaluation))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result


if __name__ == '__main__':
    run_tests()