FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PIP_DEFAULT_TIMEOUT=300

WORKDIR /app

# Install CPU-only torch first (much smaller than default)
RUN pip install --no-cache-dir \
    torch --index-url https://download.pytorch.org/whl/cpu

# Install everything else
RUN pip install --no-cache-dir \
    fastapi \
    "uvicorn[standard]" \
    scikit-learn \
    pandas \
    numpy \
    joblib \
    mlflow \
    python-multipart \
    "pydantic-settings>=2.0.0"



COPY app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]