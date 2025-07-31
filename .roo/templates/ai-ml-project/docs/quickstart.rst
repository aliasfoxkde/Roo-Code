Quick Start
===========

This guide provides a quick introduction to using the AI/ML Project Template.

Starting the Application
------------------------

To start the application, you can use one of the following methods:

Using Makefile (Recommended)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   make serve

This will start the FastAPI server on http://localhost:8000.

For development with auto-reload:

.. code-block:: bash

   make dev-serve

Using Python Directly
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   python src/api/main.py

Using Docker
~~~~~~~~~~~~

.. code-block:: bash

   docker-compose up

This will start all services defined in the docker-compose.yml file.

Accessing the API
-----------------

Once the application is running, you can access the API at:

* **API Base URL**: http://localhost:8000
* **Swagger UI**: http://localhost:8000/docs
* **ReDoc**: http://localhost:8000/redoc

Making Your First Prediction
----------------------------

To make a prediction using the API, you can use curl or any HTTP client:

.. code-block:: bash

   curl -X POST "http://localhost:8000/predict" \
        -H "Content-Type: application/json" \
        -d '{"features": [1.0, 2.0, 3.0, 4.0]}'

Training a Model
----------------

To train a model, you can use the training endpoint:

.. code-block:: bash

   curl -X POST "http://localhost:8000/train" \
        -H "Content-Type: application/json" \
        -d '{"data_path": "data/sample.csv", "model_name": "my_model", "model_type": "random_forest"}'

Or using the command line:

.. code-block:: bash

   make train

Project Structure Overview
--------------------------

The project is organized as follows:

* **src/** - Source code
* **src/api/** - API components
* **src/data/** - Data processing utilities
* **src/models/** - Model utilities
* **src/utils/** - Utility functions
* **tests/** - Test files
* **config/** - Configuration files
* **data/** - Data storage
* **models/** - Trained models
* **docs/** - Documentation
* **notebooks/** - Jupyter notebooks

Next Steps
----------

After getting familiar with the quick start, you can explore:

* :doc:`architecture` - Learn about the project architecture
* :doc:`api` - Detailed API documentation
* :doc:`data` - Data processing pipelines
* :doc:`models` - Model training and evaluation
* :doc:`testing` - Testing strategies
* :doc:`deployment` - Deployment options