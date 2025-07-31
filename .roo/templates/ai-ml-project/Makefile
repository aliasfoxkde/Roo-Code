# Makefile for AI/ML Project Template

# Variables
PYTHON := python3
PIP := pip3
VENV := venv
DOCKER := docker
DOCKER_COMPOSE := docker-compose

# Default target
.PHONY: help
help:
	@echo "AI/ML Project Template Makefile"
	@echo "=============================="
	@echo ""
	@echo "Usage:"
	@echo "  make setup          - Set up the development environment"
	@echo "  make install        - Install dependencies"
	@echo "  make test           - Run all tests"
	@echo "  make test-data      - Run data module tests"
	@echo "  make test-models    - Run model module tests"
	@echo "  make test-api       - Run API module tests"
	@echo "  make lint           - Run code linting"
	@echo "  make format         - Format code with black"
	@echo "  make jupyter        - Start Jupyter notebook"
	@echo "  make train          - Train the model"
	@echo "  make evaluate       - Evaluate the model"
	@echo "  make serve          - Start the API server"
	@echo "  make docker-build   - Build Docker images"
	@echo "  make docker-up      - Start all services with Docker Compose"
	@echo "  make docker-down    - Stop all services with Docker Compose"
	@echo "  make clean          - Clean up temporary files"

# Set up the development environment
.PHONY: setup
setup:
	@echo "Setting up development environment..."
	$(PYTHON) -m venv $(VENV)
	$(VENV)/bin/pip install --upgrade pip
	$(VENV)/bin/pip install -r requirements/development.txt
	$(VENV)/bin/pip install -e .
	@echo "Development environment set up successfully!"

# Install dependencies
.PHONY: install
install:
	@echo "Installing dependencies..."
	$(PIP) install -r requirements/development.txt
	$(PIP) install -e .
	@echo "Dependencies installed successfully!"

# Run all tests
.PHONY: test
test:
	@echo "Running all tests..."
	$(PYTHON) -m pytest tests/ -v

# Run data module tests
.PHONY: test-data
test-data:
	@echo "Running data module tests..."
	$(PYTHON) -m pytest tests/test_data.py -v

# Run model module tests
.PHONY: test-models
test-models:
	@echo "Running model module tests..."
	$(PYTHON) -m pytest tests/test_models.py -v

# Run API module tests
.PHONY: test-api
test-api:
	@echo "Running API module tests..."
	$(PYTHON) -m pytest tests/test_api.py -v

# Run code linting
.PHONY: lint
lint:
	@echo "Running code linting..."
	flake8 src/
	flake8 tests/

# Format code with black
.PHONY: format
format:
	@echo "Formatting code with black..."
	black src/
	black tests/

# Start Jupyter notebook
.PHONY: jupyter
jupyter:
	@echo "Starting Jupyter notebook..."
	jupyter lab

# Train the model
.PHONY: train
train:
	@echo "Training the model..."
	$(PYTHON) src/models/training.py

# Evaluate the model
.PHONY: evaluate
evaluate:
	@echo "Evaluating the model..."
	$(PYTHON) src/models/evaluation.py

# Start the API server
.PHONY: serve
serve:
	@echo "Starting the API server..."
	$(PYTHON) -m api.app

# Build Docker images
.PHONY: docker-build
docker-build:
	@echo "Building Docker images..."
	$(DOCKER) build -t ai-ml-project .

# Start all services with Docker Compose
.PHONY: docker-up
docker-up:
	@echo "Starting all services with Docker Compose..."
	$(DOCKER_COMPOSE) up -d

# Stop all services with Docker Compose
.PHONY: docker-down
docker-down:
	@echo "Stopping all services with Docker Compose..."
	$(DOCKER_COMPOSE) down

# Clean up temporary files
.PHONY: clean
clean:
	@echo "Cleaning up temporary files..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -f .coverage
	rm -rf htmlcov/
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	@echo "Temporary files cleaned up successfully!"