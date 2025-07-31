Deployment
==========

This document describes the deployment options and procedures for the AI/ML Project Template.

Deployment Options
------------------

The template supports multiple deployment options:

* **Standalone** - Run directly on a server
* **Docker** - Containerized deployment
* **Docker Compose** - Multi-container deployment
* **Kubernetes** - Orchestration deployment
* **Cloud Platforms** - AWS, GCP, Azure

Standalone Deployment
---------------------

For simple deployments, you can run the application directly:

1. Install dependencies:

   .. code-block:: bash

      pip install -e .

2. Start the application:

   .. code-block:: bash

      make serve
      # or
      python src/api/main.py

3. The application will be available at http://localhost:8000

Docker Deployment
-----------------

To deploy using Docker:

1. Build the Docker image:

   .. code-block:: bash

      docker build -t ai-ml-project .

2. Run the container:

   .. code-block:: bash

      docker run -p 8000:8000 ai-ml-project

3. The application will be available at http://localhost:8000

Docker Compose Deployment
-------------------------

For multi-container deployments with dependencies:

1. Build and start all services:

   .. code-block:: bash

      docker-compose up --build

2. Access the services:

   * API: http://localhost:8000
   * Jupyter Notebook: http://localhost:8888
   * MLflow: http://localhost:5000
   * PostgreSQL: localhost:5432
   * Redis: localhost:6379

Environment Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~

Configure the application through environment variables:

.. code-block:: bash

   docker run -p 8000:8000 \
              -e DATABASE_URL=postgresql://user:pass@db:5432/mydb \
              -e REDIS_URL=redis://redis:6379/0 \
              ai-ml-project

Kubernetes Deployment
---------------------

For Kubernetes deployments, use the provided manifests:

1. Deploy the application:

   .. code-block:: bash

      kubectl apply -f kubernetes/

2. Check the deployment status:

   .. code-block:: bash

      kubectl get deployments
      kubectl get services

3. Access the application through the service endpoint

Kubernetes Manifests
~~~~~~~~~~~~~~~~~~~~

The kubernetes directory contains:

* **deployment.yaml** - Application deployment
* **service.yaml** - Service definition
* **configmap.yaml** - Configuration
* **secret.yaml** - Secrets
* **ingress.yaml** - Ingress controller

Example deployment.yaml:

.. code-block:: yaml

   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: ai-ml-project
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: ai-ml-project
     template:
       metadata:
         labels:
           app: ai-ml-project
       spec:
         containers:
         - name: api
           image: ai-ml-project:latest
           ports:
           - containerPort: 8000
           envFrom:
           - configMapRef:
               name: ai-ml-config

Cloud Platform Deployment
-------------------------

AWS Deployment
~~~~~~~~~~~~~~

Deploy to AWS using ECS or Elastic Beanstalk:

1. Create an ECR repository:

   .. code-block:: bash

      aws ecr create-repository --repository-name ai-ml-project

2. Push the Docker image:

   .. code-block:: bash

      docker tag ai-ml-project:latest <account-id>.dkr.ecr.<region>.amazonaws.com/ai-ml-project:latest
      docker push <account-id>.dkr.ecr.<region>.amazonaws.com/ai-ml-project:latest

3. Deploy using ECS or Elastic Beanstalk

GCP Deployment
~~~~~~~~~~~~~~

Deploy to Google Cloud Platform using Cloud Run:

1. Build and push to Container Registry:

   .. code-block:: bash

      gcloud builds submit --tag gcr.io/<project-id>/ai-ml-project

2. Deploy to Cloud Run:

   .. code-block:: bash

      gcloud run deploy --image gcr.io/<project-id>/ai-ml-project --platform managed

Azure Deployment
~~~~~~~~~~~~~~~~

Deploy to Azure using Container Instances or App Service:

1. Push to Azure Container Registry:

   .. code-block:: bash

      az acr build --image ai-ml-project:latest --registry <registry-name> .

2. Deploy to Container Instances:

   .. code-block:: bash

      az container create --image <registry-name>.azurecr.io/ai-ml-project:latest

Configuration Management
------------------------

Configuration is managed through:

* **Configuration files** - YAML/JSON config files
* **Environment variables** - Runtime configuration
* **Secrets management** - Secure secret storage
* **ConfigMaps** - Kubernetes configuration

Example configuration hierarchy:

1. Default configuration (config/config.yaml)
2. Environment-specific overrides
3. Environment variables
4. Runtime parameters

Monitoring and Logging
----------------------

Deployed applications include monitoring:

* **Health checks** - Application health endpoints
* **Metrics** - Prometheus metrics
* **Logging** - Structured logging
* **Tracing** - Distributed tracing
* **Alerting** - Notification system

Health Check Endpoint
~~~~~~~~~~~~~~~~~~~~~

Monitor application health:

.. code-block:: bash

   curl http://localhost:8000/health

Metrics Endpoint
~~~~~~~~~~~~~~~~

Access Prometheus metrics:

.. code-block:: bash

   curl http://localhost:8000/metrics

Logging
~~~~~~~

Logs are written to:

* **Console** - Standard output
* **Files** - Log files in logs/
* **External systems** - ELK, Splunk, etc.

Example log format:

.. code-block:: json

   {
     "timestamp": "2023-01-01T00:00:00Z",
     "level": "INFO",
     "logger": "src.api.main",
     "message": "Application started successfully",
     "request_id": "12345"
   }

Scaling
-------

The application supports horizontal scaling:

* **Load balancing** - Distribute requests
* **Auto-scaling** - Adjust based on load
* **Clustering** - Multiple instances
* **Caching** - Redis for session storage

Docker Scaling
~~~~~~~~~~~~~~

Scale Docker containers:

.. code-block:: bash

   docker-compose up --scale api=3

Kubernetes Scaling
~~~~~~~~~~~~~~~~~~

Scale Kubernetes deployments:

.. code-block:: bash

   kubectl scale deployment ai-ml-project --replicas=5

Auto-scaling
~~~~~~~~~~~~

Configure auto-scaling based on metrics:

.. code-block:: yaml

   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: ai-ml-project
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: ai-ml-project
     minReplicas: 2
     maxReplicas: 10
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 70

Backup and Recovery
-------------------

Implement backup and recovery procedures:

* **Database backups** - Regular database snapshots
* **Model backups** - Versioned model storage
* **Configuration backups** - Config versioning
* **Disaster recovery** - Recovery procedures

Database Backup
~~~~~~~~~~~~~~~

Backup PostgreSQL database:

.. code-block:: bash

   pg_dump -h localhost -U username database_name > backup.sql

Model Backup
~~~~~~~~~~~~

Backup trained models:

.. code-block:: bash

   # Models are automatically versioned in models/ directory
   # Use MLflow model registry for production models

Security
--------

Security considerations for deployment:

* **Authentication** - Secure API access
* **Authorization** - Role-based access
* **Encryption** - Data encryption at rest and in transit
* **Network security** - Firewall rules
* **Vulnerability scanning** - Regular security scans

TLS/SSL
~~~~~~~

Enable HTTPS for secure communication:

.. code-block:: bash

   # In Docker Compose
   environment:
     - SSL_CERT_FILE=/certs/cert.pem
     - SSL_KEY_FILE=/certs/key.pem
   volumes:
     - ./certs:/certs

Best Practices
--------------

When deploying applications:

* Use environment-specific configurations
* Implement proper monitoring
* Enable auto-scaling
* Regular security updates
* Backup critical data
* Test deployment procedures
* Document deployment steps
* Use infrastructure as code

Rolling Updates
~~~~~~~~~~~~~~~

Perform rolling updates to minimize downtime:

.. code-block:: bash

   # Kubernetes rolling update
   kubectl set image deployment/ai-ml-project api=ai-ml-project:new-version

Blue-Green Deployment
~~~~~~~~~~~~~~~~~~~~~

Use blue-green deployment for zero-downtime updates:

1. Deploy new version alongside current version
2. Switch traffic to new version
3. Decommission old version

Next Steps
----------

For implementation details, see:

* :doc:`testing` - Testing strategies
* :doc:`api` - API endpoints
* :doc:`models` - Model training and evaluation