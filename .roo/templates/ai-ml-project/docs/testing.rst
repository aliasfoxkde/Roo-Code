Testing
=======

This document describes the testing strategy and practices for the AI/ML Project Template.

Testing Philosophy
------------------

The template follows a comprehensive testing approach:

* **Test-Driven Development (TDD)** - Write tests before implementation
* **Continuous Integration** - Run tests automatically on every change
* **Code Coverage** - Maintain high test coverage
* **Multiple Test Types** - Unit, integration, and end-to-end tests

Test Directory Structure
------------------------

The tests directory is organized as follows:

.. code-block:: text

   tests/
   ├── unit/           # Unit tests
   ├── integration/    # Integration tests
   ├── e2e/            # End-to-end tests
   ├── fixtures/       # Test data and fixtures
   ├── mocks/          # Mock objects
   └── conftest.py     # pytest configuration

Test Types
----------

Unit Tests
~~~~~~~~~~

Unit tests focus on individual functions and classes:

* Test isolated functionality
* Use mocks and fixtures
* Run quickly
* High coverage target (90%+)

Example:

.. code-block:: python

   def test_data_processor_handle_missing_values():
       processor = DataProcessor()
       df_with_nan = pd.DataFrame({'col1': [1, 2, np.nan, 4]})
       result = processor.handle_missing_values(df_with_nan, strategy='mean')
       assert not result.isnull().any().any()

Integration Tests
~~~~~~~~~~~~~~~~~

Integration tests verify interactions between components:

* Test API endpoints
* Test database interactions
* Test external service calls
* Test data flow between layers

Example:

.. code-block:: python

   def test_api_predict_endpoint(client, sample_data):
       response = client.post('/predict', json={'features': [1, 2, 3, 4]})
       assert response.status_code == 200
       assert 'prediction' in response.json()

End-to-End Tests
~~~~~~~~~~~~~~~~

End-to-end tests verify complete workflows:

* Test complete user journeys
* Test model training and prediction
* Test data pipeline from start to finish
* Test deployment scenarios

Example:

.. code-block:: python

   def test_complete_model_lifecycle():
       # Train model
       train_model('data/sample.csv', 'test_model')
       
       # Make prediction
       prediction = predict('test_model', [1, 2, 3, 4])
       
       # Validate result
       assert prediction in [0, 1]

Test Framework
--------------

The template uses pytest as the testing framework:

* **pytest** - Test runner and framework
* **pytest-mock** - Mocking utilities
* **pytest-cov** - Coverage reporting
* **pytest-html** - HTML test reports
* **pytest-xdist** - Parallel test execution

Running Tests
-------------

Run all tests:

.. code-block:: bash

   make test
   # or
   pytest

Run specific test types:

.. code-block:: bash

   # Unit tests
   pytest tests/unit/
   
   # Integration tests
   pytest tests/integration/
   
   # End-to-end tests
   pytest tests/e2e/

Run tests with coverage:

.. code-block:: bash

   make test-cov
   # or
   pytest --cov=src --cov-report=html

Run tests in parallel:

.. code-block:: bash

   pytest -n auto

Test Configuration
------------------

Tests are configured through:

* **pytest.ini** - pytest configuration
* **conftest.py** - pytest fixtures and plugins
* **Environment variables** - Test-specific settings

Example pytest.ini:

.. code-block:: ini

   [pytest]
   minversion = 6.0
   addopts = -v --tb=short
   testpaths = tests
   markers =
       slow: marks tests as slow
       integration: marks tests as integration tests

Test Fixtures
-------------

Common test fixtures include:

* **client** - Test client for API testing
* **sample_data** - Sample data for testing
* **mock_model** - Mock model for testing
* **temp_dir** - Temporary directory for file operations

Example fixture:

.. code-block:: python

   @pytest.fixture
   def sample_data():
       return pd.DataFrame({
           'feature_1': [1, 2, 3, 4, 5],
           'feature_2': [2, 4, 6, 8, 10],
           'target': [0, 1, 0, 1, 0]
       })

Mocking
-------

Use mocks to isolate tests:

* **pytest-mock** - pytest's mocking plugin
* **unittest.mock** - Python's built-in mocking
* **responses** - HTTP request mocking
* **freezegun** - Time mocking

Example mock:

.. code-block:: python

   def test_model_training_with_mock(mocker):
       mock_model = mocker.Mock()
       mocker.patch('src.models.trainer.ModelTrainer.train', return_value=mock_model)
       
       result = train_model('data/sample.csv', 'test_model')
       assert result is mock_model

Test Data
---------

Test data management:

* **fixtures/** - Static test data
* **factories** - Dynamic test data generation
* **mocks** - Simulated external data
* **snapshots** - Expected output verification

Example factory:

.. code-block:: python

   def create_sample_dataframe(rows=100):
       return pd.DataFrame({
           'feature_1': np.random.rand(rows),
           'feature_2': np.random.rand(rows),
           'target': np.random.randint(0, 2, rows)
       })

Continuous Integration
----------------------

Tests are run automatically in CI:

* **GitHub Actions** - Automated testing
* **Pre-commit hooks** - Local testing
* **Code quality checks** - Linting and formatting
* **Security scans** - Vulnerability detection

Example GitHub Actions workflow:

.. code-block:: yaml

   name: Tests
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Set up Python
           uses: actions/setup-python@v2
           with:
             python-version: 3.9
         - name: Install dependencies
           run: pip install -e .[dev]
         - name: Run tests
           run: pytest --cov=src

Best Practices
--------------

When writing tests:

* Write clear, descriptive test names
* Test one thing at a time
* Use appropriate assertions
* Handle edge cases
* Mock external dependencies
* Maintain test data separately
* Keep tests fast and reliable
* Update tests with code changes

Coverage
--------

Maintain high test coverage:

* **Target**: 90%+ coverage
* **Minimum**: 80% coverage
* **Report**: HTML coverage reports
* **Enforcement**: Coverage requirements in CI

Example coverage report command:

.. code-block:: bash

   pytest --cov=src --cov-report=html --cov-report=term

Next Steps
----------

For implementation details, see:

* :doc:`deployment` - Deployment strategies
* :doc:`api` - API endpoints
* :doc:`models` - Model training and evaluation