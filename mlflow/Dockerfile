FROM python:3.11-slim
ENV PIP_DEFAULT_TIMEOUT=200
ENV PIP_RETRIES=5
RUN pip install --no-cache-dir "mlflow==2.13.0" psycopg2-binary
RUN mkdir -p /mlruns
EXPOSE 5000
CMD mlflow server \
    --backend-store-uri $DB_URI \
    --default-artifact-root /mlruns \
    --host 0.0.0.0 \
    --port 5000 \
    --gunicorn-opts "--timeout 300 --workers 2 --log-level error"