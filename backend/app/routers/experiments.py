from fastapi import APIRouter, HTTPException

from app.schemas.experiment import ExperimentSummary
from app.services.mlflow_service import mlflow_service
from app.services.model_service import model_service

router = APIRouter(tags=["experiments"])


@router.get("/api/experiments")
def list_experiments() -> list[dict]:
    return mlflow_service.get_all_experiments()


@router.get("/api/experiments/{experiment_name}/runs", response_model=ExperimentSummary)
def get_experiment_runs(experiment_name: str) -> ExperimentSummary:
    try:
        return mlflow_service.get_experiment_runs(experiment_name)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/api/experiments/runs/{run_id}/metrics/{metric_name}")
def get_metric_history(run_id: str, metric_name: str) -> list[dict]:
    return mlflow_service.get_run_metric_history(run_id, metric_name)


@router.get("/api/model/info")
def get_model_info() -> dict:
    return model_service.get_model_info()
