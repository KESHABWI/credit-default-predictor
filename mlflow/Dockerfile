FROM python:3.11-slim

ENV PIP_DEFAULT_TIMEOUT=300
ENV PIP_RETRIES=5

RUN pip install --no-cache-dir "mlflow==3.13.0" psycopg2-binary

RUN mkdir -p /mlflow/artifacts

EXPOSE 5000

CMD mlflow server \
    --backend-store-uri $MLFLOW_BACKEND_STORE_URI \
    --default-artifact-root $MLFLOW_DEFAULT_ARTIFACT_ROOT \
    --host 0.0.0.0 \
    --port 5000 \
    --allowed-hosts '*'