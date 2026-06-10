from typing import Optional

from pydantic import BaseModel


class ExperimentRun(BaseModel):
    run_id: str
    run_name: str
    status: str
    start_time: Optional[int]
    metrics: dict[str, float]
    params: dict[str, str]
    tags: dict[str, str]


class ExperimentSummary(BaseModel):
    experiment_id: str
    experiment_name: str
    total_runs: int
    best_run_id: Optional[str]
    best_auc: Optional[float]
    runs: list[ExperimentRun]
