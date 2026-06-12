from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import prediction, experiments

app = FastAPI(
    title="Credit Default Prediction API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction.router)
app.include_router(experiments.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "model_loaded": True}
