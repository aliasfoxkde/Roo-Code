Installation
============

This section covers how to install and set up the AI/ML Project Template.

Prerequisites
-------------

Before installing, ensure you have the following prerequisites:

* Python 3.8 or higher
* pip (Python package installer)
* Git (for version control)
* Docker (optional, for containerization)
* Docker Compose (optional, for multi-container setup)

Basic Installation
------------------

1. Clone the repository:

   .. code-block:: bash

      git clone <repository-url>
      cd ai-ml-project-template

2. Create a virtual environment:

   .. code-block:: bash

      python -m venv venv
      source venv/bin/activate  # On Windows: venv\Scripts\activate

3. Install the package in development mode:

   .. code-block:: bash

      pip install -e .[dev]

   Or using the Makefile:

   .. code-block:: bash

      make install-dev

Docker Installation
-------------------

If you prefer to use Docker, you can build and run the application using Docker Compose:

1. Build and start all services:

   .. code-block:: bash

      docker-compose up --build

2. Access the services:

   * API: http://localhost:8000
   * Jupyter Notebook: http://localhost:8888
   * MLflow: http://localhost:5000
   * PostgreSQL: localhost:5432
   * Redis: localhost:6379

Configuration
-------------

After installation, you may need to configure the application:

1. Copy the sample configuration file:

   .. code-block:: bash

      cp config/config.yaml.example config/config.yaml

2. Edit the configuration file to match your environment:

   .. code-block:: bash

      nano config/config.yaml

Environment Variables
---------------------

The application can also be configured using environment variables. See the configuration
section for details on available environment variables.

Verification
------------

To verify that the installation was successful, run the tests:

.. code-block:: bash

   make test

Or run them directly with pytest:

.. code-block:: bash

   pytest

You should see output indicating that all tests pass.

Next Steps
----------

After installation, you can proceed to the :doc:`quickstart` guide to learn how to use
the template.