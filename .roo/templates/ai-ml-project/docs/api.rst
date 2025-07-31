API Documentation
=================

This document provides detailed information about the API endpoints.

Base URL
--------

All API endpoints are relative to the base URL:

.. code-block:: text

   http://localhost:8000

Authentication
--------------

The API uses token-based authentication. Include the token in the
Authorization header:

.. code-block:: text

   Authorization: Bearer <token>

Endpoints
---------

Health Check
~~~~~~~~~~~~

Check the health status of the application.

* **URL**: ``/health``
* **Method**: ``GET``
* **Authentication**: Not required

**Response**:

.. code-block:: json

   {
     "status": "healthy",
     "timestamp": "2023-01-01T00:00:00Z",
     "version": "1.0.0"
   }

Make Prediction
~~~~~~~~~~~~~~~

Make a prediction using a trained model.

* **URL**: ``/predict``
* **Method**: ``POST``
* **Authentication**: Required

**Request Body**:

.. code-block:: json

   {
     "features": [1.0, 2.0, 3.0, 4.0]
   }

**Response**:

.. code-block:: json

   {
     "prediction": 1,
     "probability": [0.3, 0.7],
     "timestamp": "2023-01-01T00:00:00Z"
   }

Train Model
~~~~~~~~~~~

Train a new machine learning model.

* **URL**: ``/train``
* **Method**: ``POST``
* **Authentication**: Required

**Request Body**:

.. code-block:: json

   {
     "data_path": "data/sample.csv",
     "model_name": "my_model",
     "model_type": "random_forest",
     "parameters": {
       "n_estimators": 100,
       "max_depth": 10
     }
   }

**Response**:

.. code-block:: json

   {
     "status": "success",
     "model_name": "my_model",
     "timestamp": "2023-01-01T00:00:00Z"
   }

Model Information
~~~~~~~~~~~~~~~~~

Get information about a trained model.

* **URL**: ``/model/info/{model_name}``
* **Method**: ``GET``
* **Authentication**: Required

**Response**:

.. code-block:: json

   {
     "model_type": "RandomForestClassifier",
     "parameters": {
       "n_estimators": 100,
       "max_depth": 10
     },
     "feature_importances": [0.1, 0.2, 0.3, 0.4],
     "training_metrics": {
       "accuracy": 0.95,
       "precision": 0.93,
       "recall": 0.97
     }
   }

Error Responses
---------------

The API uses standard HTTP status codes to indicate the success or failure
of requests:

* **200 OK**: Success
* **400 Bad Request**: Invalid request data
* **401 Unauthorized**: Authentication required
* **404 Not Found**: Resource not found
* **500 Internal Server Error**: Server error

Error responses follow this format:

.. code-block:: json

   {
     "detail": "Error message"
   }

Rate Limiting
-------------

The API implements rate limiting to prevent abuse:

* **Limit**: 100 requests per minute
* **Burst**: 20 requests per second

Exceeding the rate limit will result in a 429 (Too Many Requests) response.

Versioning
----------

The API supports versioning through the Accept header:

.. code-block:: text

   Accept: application/vnd.ai-ml.v1+json

WebSockets
----------

The API also supports WebSocket connections for real-time communication:

* **URL**: ``ws://localhost:8000/ws``
* **Authentication**: Token-based

WebSockets are used for:

* Real-time predictions
* Training progress updates
* Notifications

Documentation
-------------

Interactive API documentation is available at:

* **Swagger UI**: ``/docs``
* **ReDoc**: ``/redoc``

These interfaces provide detailed information about all endpoints,
request/response schemas, and allow testing requests directly from
the browser.

Next Steps
----------

For implementation details, see:

* :doc:`models` - Model training and evaluation
* :doc:`data` - Data processing
* :doc:`deployment` - Deployment options