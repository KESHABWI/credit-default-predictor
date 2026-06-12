# credit-default-predictor

A deep learning application to predict the probability of customer credit card default.

## 🛠️ Stack

| Layer                   | Technology |
| ----------------------- | ---------- |
| Deep Learning Framework | PyTorch    |
| Backend API             | FastAPI    |
| Frontend Framework      | Next.js 14 |
| Experiment Tracking     | MLflow     |
| Metadata Store          | PostgreSQL |
| Containerisation        | Docker     |

## 📂 Project Structure

```
credit-default-predictor/
├── backend/          - FastAPI backend server and ML inference service
├── frontend/         - Next.js 14 frontend web dashboard and user interface
├── mlflow/           - Dockerfile and server configuration for MLflow tracking
├── model/            - Pre-trained PyTorch model, scaler, and configuration files
└── docker-compose.yml - Orchestration configuration for all containerized services
```

## 🚀 Quick Start

### Prerequisites

- Docker Desktop

### Steps

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone https://github.com/your-username/credit-default-predictor.git
   cd credit-default-predictor
   ```
2. Start all services:
   ```bash
   docker-compose up --build
   ```

### URLs

| Service  | URL                          |
| -------- | ---------------------------- |
| Frontend | `http://localhost:3000`      |
| API      | `http://localhost:8000`      |
| MLflow   | `http://localhost:5001`      |
| API Docs | `http://localhost:8000/docs` |

npx localtunnel --port 5001 --local-host localhost

## 🏗️ Architecture

The application runs as four containerized services within a single Docker network. A PostgreSQL database serves as the backend metadata store for the MLflow tracking server. The FastAPI backend queries the MLflow server to list experiment runs, mounts the local model directory to access PyTorch artifacts for inference, and exposes endpoints for predictions. The Next.js frontend runs in the client browser and directly calls the FastAPI backend to perform predictions and visualize model runs.

## 🧠 Model

- **Architecture**: Deep Multi-Layer Perceptron (DeepMLP) implemented in PyTorch, comprising an input layer (39 dimensions), three hidden blocks with Batch Normalization, ReLU, and Dropout layers (sizes 256, 128, 64), a final ReLU projection layer (size 32), and a linear output layer.
- **Features**: 39 features, including engineered monthly payment ratios, total billing and payment sums, overall utilization rate, and delayed month statistics, alongside encoded demographics (gender, education, and marital status).
- **Threshold**: Classification decision threshold set to `0.35` to classify credit default risk.
- **Performance Metrics**: Models are evaluated and logged via MLflow using validation and test Area Under the ROC Curve (AUC) metrics (`val_auc` and `test_auc`), optimized with Binary Cross-Entropy with Logits loss.

## 🔌 API Endpoints

| Method | Endpoint           | Description                                                        |
| ------ | ------------------ | ------------------------------------------------------------------ |
| GET    | `/health`          | Returns service health status and model load state                 |
| POST   | `/api/predict`     | Predicts default probability and risk level for a customer profile |
| GET    | `/api/model/info`  | Returns metadata and layer architecture of the active model        |
| GET    | `/api/experiments` | Lists all experiment logs and runs from MLflow                     |

## 💻 Development

### Running the Backend Locally

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
3. Install the backend package and dependencies:
   ```bash
   pip install -e .
   ```
4. Set the MLflow tracking URI to point to the MLflow container (or a local instance):
   ```bash
   export MLFLOW_TRACKING_URI=http://localhost:5001
   ```
5. Start the development server using Uvicorn:
   ```bash
   uvicorn app.main:app --reload
   ```

_Note: Since the backend expects model files in `/app/model`, you can create a local symlink on macOS/Linux:_

```bash
sudo mkdir -p /app && sudo ln -s $(pwd)/../model /app/model
```

### Running the Frontend Locally

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Set the backend API URL:
   ```bash
   export NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Run the Next.js development server:
   ```bash
   npm run dev
   ```
