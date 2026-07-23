# 💳 Credit Default Predictor

An end-to-end, production-ready Machine Learning and Deep Learning web platform for predicting credit card default probabilities, performing exploratory data analysis, evaluating model metrics, and tracking experiments with MLflow.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MLflow](https://img.shields.io/badge/MLflow-Tracking-0194E2?style=for-the-badge&logo=mlflow&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 🌟 Overview

**Credit Default Predictor** bridges the gap between machine learning experimentation and interactive web-based financial decision systems. Built on the **Default of Credit Card Clients Dataset**, the application enables financial analysts, risk managers, and data scientists to evaluate borrower risk profiles through multi-model scoring, feature engineering, and real-time decision boundary adjustments.

---

## ✨ Key Features

- ⚡ **Multi-Model Risk Engine**: Evaluate risk instantly across multiple trained model architectures:
  - **Machine Learning**: LightGBM, XGBoost, CatBoost, Random Forest, Logistic Regression
  - **Deep Learning**: PyTorch Deep & Simple Multilayer Perceptrons (MLPs) with BatchNorm and Dropout regularizers
- 🎯 **Interactive Risk Prediction**:
  - Predict default probability with customizable client demographic & financial parameters.
  - **One-Click Presets**: Test Low-Risk, High-Risk (Imbalanced Payment Delays), and Default client profiles instantly.
  - Feature engineering pipeline (utilization rates, delay counters, bill trends, payment ratios).
- 📊 **Exploratory Data Analysis (EDA) Dashboard**:
  - Interactive distribution charts for credit limit, demographics, and payment history.
  - Payment delay vs. default rate breakdown, correlation heatmaps, and financial utilization analytics.
- 🔬 **Model Experimentation & Benchmark Suite**:
  - Live model comparison matrix with ROC-AUC, F1-Score, Precision, Recall, and confusion matrices.
  - Dynamic classification threshold tuning to visualize trade-offs between false positives and false negatives.
- 📽️ **Interactive Executive Presentation**:
  - Built-in 15-slide interactive slide deck designed with Apple-inspired UX.
  - Interactive neural network diagrams, threshold simulation widgets, and architectural blueprints.
- 🐳 **MLOps & Tracking Pipeline**:
  - MLflow experiment tracking integration backed by PostgreSQL database for persistent metric, parameter, and artifact logging.
  - Fully containerized environment using Docker & Docker Compose.

---

## 📊 Model Leaderboard & Benchmarks

Models trained and evaluated on the dataset validation split:

| Model Architecture | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Optimal Threshold |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **XGBoost (Tuned)** | `0.7851` | `0.5128` | `0.5724` | **`0.5410`** | `0.7697` | `0.42` |
| **CatBoost (Tuned)** | `0.7761` | `0.4950` | `0.5950` | `0.5404` | **`0.7727`** | `0.37` |
| **LightGBM (Tuned)** ⭐ | `0.7752` | `0.4931` | `0.5671` | `0.5275` | `0.7706` | `0.35` |
| **DL AttentionNet / SimpleMLP** | `0.7846` | `0.5130` | `0.5204` | `0.5167` | `0.7528` | `0.54` |
| **Random Forest (Tuned)** | `0.7720` | `0.4850` | `0.5820` | `0.5291` | `0.7650` | `0.35` |
| **Logistic Regression** | `0.7469` | `0.2475` | `0.9374` | `0.3916` | `0.7469` | `0.30` |

---

## 🛠️ Architecture & Tech Stack

```text
               ┌──────────────────────────────────────────────┐
               │              Next.js 15 Frontend             │
               │   (React 19, TypeScript, Tailwind CSS)      │
               └──────────────────────┬───────────────────────┘
                                      │  HTTP REST Requests
                                      ▼
               ┌──────────────────────────────────────────────┐
               │               FastAPI Backend                │
               │   (Python 3.11, PyTorch, Scikit-Learn)       │
               └──────────────┬────────────────┬──────────────┘
                              │                │
           Artifact & Models  │                │ Experiment Tracking
                              ▼                ▼
                ┌──────────────────┐    ┌──────────────────┐
                │ Model Artifacts  │    │  MLflow Server   │
                │ (.pkl / .pt)     │    │  & PostgreSQL    │
                └──────────────────┘    └──────────────────┘
```

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Recharts.
- **Backend API**: FastAPI, Uvicorn, PyTorch, Joblib, Scikit-learn, LightGBM, XGBoost, CatBoost.
- **ML & Data Infrastructure**: Pandas, NumPy, Scikit-learn, PyTorch, MLflow, PostgreSQL 16.
- **Deployment & Orchestration**: Docker, Docker Compose, UV package manager.

---

## 📁 Repository Structure

```text
credit-default-predictor/
├── backend/                  # FastAPI Backend Application
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint & routes
│   │   ├── schemas.py        # Request/Response validation schemas
│   │   └── services/         # Model inference service & preprocessing
│   ├── Dockerfile            # Container configuration for backend
│   └── pyproject.toml        # Dependencies managed by UV
├── frontend/                 # Next.js Frontend Application
│   ├── app/                  # Next.js App Router pages
│   │   ├── dashboard/        # Main dashboard overview
│   │   ├── eda/              # Exploratory Data Analysis suite
│   │   ├── experiments/      # Model metrics & MLflow experiment viewer
│   │   ├── predict/          # Single client prediction tool with presets
│   │   └── presentation/     # 15-slide interactive executive presentation
│   ├── components/           # Reusable UI components (Sidebar, Navbar, Cards)
│   ├── Dockerfile            # Multi-stage Docker build for Next.js
│   └── package.json          # Node.js dependencies
├── model/                    # ML/DL Training Artifacts & Notebooks
│   ├── artifacts/            # Scalers, encoders, and feature metadata
│   ├── models/               # Saved model binaries (dl/ & ml/)
│   └── notebooks/            # Jupyter notebooks for model training & tuning
├── mlflow/                   # MLflow Docker setup & configuration
└── docker-compose.yml        # Multi-container service orchestration
```

---

## 🚀 Quick Start with Docker

The fastest way to launch the entire stack (PostgreSQL, MLflow, Backend API, and Next.js Frontend) is using **Docker Compose**:

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Docker Compose v2+)

### Launching the Application

```bash
# 1. Clone the repository
git clone https://github.com/KESHABWI/credit-default-predictor.git
cd credit-default-predictor

# 2. Build and start all services
docker compose up --build
```

### Access Points

Once services are running, access them via:

- 💻 **Web Application (Frontend)**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **FastAPI Backend API**: [http://localhost:8000](http://localhost:8000)
- 📖 **Interactive API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 📈 **MLflow Tracking Dashboard**: [http://localhost:5001](http://localhost:5001)

---

## 💻 Local Development Setup

If you prefer to run services individually for local development:

### Backend Setup (FastAPI)

```bash
cd backend

# Install dependencies using uv
uv sync

# Run FastAPI development server
uv run fastapi dev app/main.py --port 8000
```

### Frontend Setup (Next.js)

```bash
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Backend service status and loaded model verification |
| `GET` | `/models` | Retrieves metadata and registered models list |
| `POST` | `/predict` | Predicts default risk probability for a single client profile |
| `POST` | `/predict_batch` | Batch prediction endpoint for multiple client records |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
