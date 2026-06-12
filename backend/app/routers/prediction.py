import asyncio

from fastapi import APIRouter, HTTPException

from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.model_service import model_service

router = APIRouter(prefix="/api/predict", tags=["prediction"])


@router.post("", response_model=PredictionResponse)
async def predict(request: PredictionRequest) -> PredictionResponse:
    try:
        # Run sync model inference in a thread pool so it doesn't block the event loop
        result = await asyncio.get_event_loop().run_in_executor(
            None,
            model_service.predict,
            request.model_dump(),
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
