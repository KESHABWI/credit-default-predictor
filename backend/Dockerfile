FROM python:3.11-slim

ENV PIP_DEFAULT_TIMEOUT=200

WORKDIR /app

# Install uv, then use it to install project dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir uv && \
    uv pip install --system --no-cache --index-url https://download.pytorch.org/whl/cpu torch && \
    uv pip install --system --no-cache -r pyproject.toml

# Copy application source
COPY app/ ./app/

# Model artifacts are expected at /app/model (bind-mounted or COPY'd)
# COPY ../model/ ./model/   # uncomment if not using a volume mount

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
