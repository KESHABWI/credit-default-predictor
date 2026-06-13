import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import prediction, experiments

app = FastAPI(
    title="Credit Default Prediction API",
    version="1.0.0",
)

# Origins explicitly listed here cover the common dev scenarios:
#   - Next.js dev server (localhost)
#   - Docker-compose frontend container (host.docker.internal)
#   - Any extra origins injected via the CORS_ORIGINS env var (comma-separated)
_default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://host.docker.internal:3000",
]

_extra = os.getenv("CORS_ORIGINS", "")
_extra_origins = [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins + _extra_origins,
    # Regex catches localhost / 127.0.0.1 on *any* port — useful for tunnels
    # and for the Next.js dev server when it picks a random port.
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

app.include_router(prediction.router)
app.include_router(experiments.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "model_loaded": True}

