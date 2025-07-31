Usage
=====

Training Models
---------------

To train a model, run:

.. code-block:: bash

   make train

Or directly:

.. code-block:: bash

   python scripts/train_model.py

The training script will:

1. Load the configuration from ``config/config.yaml``
2. Load and preprocess the data
3. Initialize the model
4. Train the model
5. Save the trained model to the ``models/`` directory
6. Log the training metrics

Running the API
---------------

To start the API server:

.. code-block:: bash

   make run

Or directly:

.. code-block:: bash

   uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

The API will be available at http://localhost:8000. You can access the interactive documentation at http://localhost:8000/docs.

API Endpoints
~~~~~~~~~~~~~

The API provides the following endpoints:

* ``GET /`` - Health check endpoint
* ``POST /predict`` - Make predictions using a trained model
* ``POST /train`` - Train a new model
* ``GET /models`` - List available models
* ``GET /models/{model_id}`` - Get model details
* ``DELETE /models/{model_id}`` - Delete a model

Using Jupyter Notebooks
-----------------------

To start Jupyter:

.. code-block:: bash

   make notebook

Or directly:

.. code-block:: bash

   jupyter notebook

The Jupyter server will be available at http://localhost:8888. You can access the notebooks in the ``notebooks/`` directory.

Using TensorBoard
-----------------

To start TensorBoard:

.. code-block:: bash

   make tensorboard

Or directly:

.. code-block:: bash

   tensorboard --logdir=logs

TensorBoard will be available at http://localhost:6006. You can visualize training metrics, model graphs, and other data.

Testing
-------

Run all tests:

.. code-block:: bash

   make test

Or directly:

.. code-block:: bash

   pytest tests/ -v

Run tests with coverage:

.. code-block:: bash

   pytest tests/ -v --cov=src --cov-report=html

The test coverage report will be available in the ``htmlcov/`` directory.