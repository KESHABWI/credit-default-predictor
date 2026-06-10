import os
import mlflow
from mlflow.tracking import MlflowClient

from app.schemas.experiment import ExperimentRun, ExperimentSummary


class MLflowService:
    def __init__(self):
        tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
        mlflow.set_tracking_uri(tracking_uri)
        self.client = MlflowClient()

    def get_all_experiments(self) -> list[dict]:
        experiments = self.client.search_experiments()
        result = []
        for exp in experiments:
            runs = self.client.search_runs(experiment_ids=[exp.experiment_id])
            result.append(
                {
                    "experiment_id": exp.experiment_id,
                    "experiment_name": exp.name,
                    "total_runs": len(runs),
                }
            )
        return result

    def get_experiment_runs(self, experiment_name: str) -> ExperimentSummary:
        experiment = self.client.get_experiment_by_name(experiment_name)
        if experiment is None:
            raise ValueError(f"Experiment '{experiment_name}' not found")

        mlflow_runs = self.client.search_runs(
            experiment_ids=[experiment.experiment_id],
            order_by=["start_time DESC"],
        )

        runs: list[ExperimentRun] = []
        best_run_id: str | None = None
        best_auc: float | None = None

        for r in mlflow_runs:
            metrics = {k: v for k, v in r.data.metrics.items()}
            params = {k: str(v) for k, v in r.data.params.items()}
            tags = {k: str(v) for k, v in r.data.tags.items() if not k.startswith("mlflow.")}

            runs.append(
                ExperimentRun(
                    run_id=r.info.run_id,
                    run_name=r.info.run_name or "",
                    status=r.info.status,
                    start_time=r.info.start_time,
                    metrics=metrics,
                    params=params,
                    tags=tags,
                )
            )

            # Track best run by test_auc, falling back to val_auc
            auc = metrics.get("test_auc") or metrics.get("val_auc")
            if auc is not None and (best_auc is None or auc > best_auc):
                best_auc = auc
                best_run_id = r.info.run_id

        return ExperimentSummary(
            experiment_id=experiment.experiment_id,
            experiment_name=experiment_name,
            total_runs=len(runs),
            best_run_id=best_run_id,
            best_auc=best_auc,
            runs=runs,
        )

    def get_run_metric_history(self, run_id: str, metric_name: str) -> list[dict]:
        history = self.client.get_metric_history(run_id, metric_name)
        return [
            {"step": m.step, "value": m.value, "timestamp": m.timestamp}
            for m in history
        ]


mlflow_service = MLflowService()
