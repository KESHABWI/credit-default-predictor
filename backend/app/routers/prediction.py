import asyncio
import functools

from fastapi import APIRouter, HTTPException

from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.model_service import model_service

router = APIRouter(prefix="/api", tags=["prediction"])


@router.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest) -> PredictionResponse:
    raw = request.model_dump()
    model_key = raw.pop("model", "simple_mlp")
    try:
        result = await asyncio.get_event_loop().run_in_executor(
            None,
            functools.partial(model_service.predict, raw, model_key),
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/models")
async def list_models() -> dict:
    return model_service.get_models_registry()


@router.get("/model/info")
async def model_info() -> dict:
    return model_service.get_model_info()
