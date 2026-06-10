# Credit Default Predictor

A production-grade deep learning web application that predicts the probability of credit default.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend API | FastAPI + Uvicorn |
| ML Framework | PyTorch + scikit-learn |
| Experiment Tracking | MLflow |
| Metadata Store | PostgreSQL 16 |
| Containerisation | Docker Compose |
| Frontend | TBD |

## Quick start

```bash
# Start all services
docker compose up --build

# API docs
open http://localhost:8000/docs

# MLflow UI
open http://localhost:5000
```

## Project layout

```
credit-default-predictor/
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── main.py           # App entrypoint, CORS, routers
│   │   ├── routers/          # prediction & experiments endpoints
│   │   ├── services/         # model_service, mlflow_service
│   │   └── schemas/          # Pydantic request/response models
│   ├── pyproject.toml        # uv-compatible dependency manifest
│   └── Dockerfile
├── frontend/         # (TBD)
├── mlflow/           # MLflow server container
│   └── Dockerfile
├── model/            # Trained model artifacts
│   └── README.md
└── docker-compose.yml
```

## Environment variables

| Variable | Service | Default | Description |
|----------|---------|---------|-------------|
| `MLFLOW_TRACKING_URI` | backend | `http://mlflow:5000` | MLflow tracking server URL |
| `POSTGRES_USER` | postgres / mlflow | `mlflow` | Database user |
| `POSTGRES_PASSWORD` | postgres / mlflow | `mlflow` | Database password |
| `POSTGRES_DB` | postgres / mlflow | `mlflow` | Database name |
