import json
import joblib
import torch
import torch.nn as nn
import pandas as pd
import numpy as np
from pathlib import Path

MODEL_DIR = Path("/app/model")
if not MODEL_DIR.exists():
    # Fallback to local workspace model directory
    MODEL_DIR = Path(__file__).resolve().parents[3] / "model"


class DeepMLP(nn.Module):
    def __init__(self, input_dim: int, dropout1: float = 0.3, dropout2: float = 0.3, dropout3: float = 0.2):
        super().__init__()
        self.block1 = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(dropout1),
        )
        self.block2 = nn.Sequential(
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(dropout2),
        )
        self.block3 = nn.Sequential(
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(dropout3),
        )
        self.block4 = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
        )
        self.output_layer = nn.Linear(32, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = self.block4(x)
        return self.output_layer(x)


class ModelService:
    def __init__(self):
        with open(MODEL_DIR / "model_info.json") as f:
            self.model_info: dict = json.load(f)

        self.feature_names: list[str] = self.model_info["features"]
        self.scale_cols: list[str] = self.model_info["scale_cols"]
        self.threshold: float = self.model_info["decision_threshold"]

        self.scaler = joblib.load(MODEL_DIR / "scaler.pkl")
        self.clip_bounds: dict = joblib.load(MODEL_DIR / "clip_bounds.pkl")

        dropout = self.model_info["dropout_rates"]
        self.model = DeepMLP(
            input_dim=self.model_info["input_dim"],
            dropout1=dropout["dropout1"],
            dropout2=dropout["dropout2"],
            dropout3=dropout["dropout3"],
        )
        weights_path = MODEL_DIR / "DeepMLP_weights.pt"
        self.model.load_state_dict(torch.load(weights_path, map_location="cpu"))
        self.model.eval()

    def predict(self, raw_input: dict) -> dict:
        # Convert raw input to DataFrame
        df = pd.DataFrame([raw_input])

        # ── Feature Engineering ──────────────────────────────────────────
        # Feature 1: Payment Ratio per month
        # Formula: PAY_AMT{i} / (BILL_AMT{i}.abs() + 1)
        # Range: clip(0, 5)
        for i in range(1, 7):
            df[f'PAY_RATIO_{i}'] = (
                df[f'PAY_AMT{i}'] / (df[f'BILL_AMT{i}'].abs() + 1)
            ).clip(0.0, 5.0)

        # Feature 2: Total Bill (6-month sum)
        bill_cols = [f'BILL_AMT{i}' for i in range(1, 7)]
        df['TOTAL_BILL'] = df[bill_cols].sum(axis=1)

        # Feature 3: Total Payment (6-month sum)
        pay_amt_cols = [f'PAY_AMT{i}' for i in range(1, 7)]
        df['TOTAL_PAID'] = df[pay_amt_cols].sum(axis=1)

        # Feature 4: Overall Payment Coverage
        df['OVERALL_PAY_RATIO'] = (df['TOTAL_PAID'] / (df['TOTAL_BILL'].abs() + 1)).clip(0.0, 5.0)

        # Feature 5: Credit Utilization Rate
        df['UTIL_RATE'] = (df['BILL_AMT1'] / (df['LIMIT_BAL'] + 1)).clip(0.0, 2.0)

        # Feature 6: Count of Delayed Months
        pay_st_cols = ['PAY_0', 'PAY_2', 'PAY_3', 'PAY_4', 'PAY_5', 'PAY_6']
        df['DELAY_COUNT'] = (df[pay_st_cols] > 0).sum(axis=1).astype(float)

        # Feature 7: Maximum Delay
        df['MAX_DELAY'] = df[pay_st_cols].max(axis=1).astype(float)

        # Feature 8: Average Delay
        df['AVG_DELAY'] = df[pay_st_cols].mean(axis=1)

        # ── Categorical Encoding ──────────────────────────────────────────
        # SEX: 1=Male, 2=Female -> remap to 0/1 binary
        df['SEX'] = df['SEX'].map({1: 0.0, 2: 1.0})

        # EDUCATION: One-Hot (EDU_2, EDU_3, EDU_4)
        df['EDU_2'] = (df['EDUCATION'] == 2).astype(float)
        df['EDU_3'] = (df['EDUCATION'] == 3).astype(float)
        df['EDU_4'] = (df['EDUCATION'] == 4).astype(float)

        # MARRIAGE: One-Hot (MAR_2, MAR_3)
        df['MAR_2'] = (df['MARRIAGE'] == 2).astype(float)
        df['MAR_3'] = (df['MARRIAGE'] == 3).astype(float)

        # Drop original columns that are no longer features
        df = df.drop(columns=['EDUCATION', 'MARRIAGE'], errors='ignore')

        # Reorder and filter columns to match the 39 expected model features
        df = df[self.feature_names]

        # Clip outliers using stored bounds
        for col, (lower, upper) in self.clip_bounds.items():
            if col in df.columns:
                df[col] = df[col].clip(lower, upper)

        # Scale only the continuous columns; leave binary columns as-is
        df[self.scale_cols] = self.scaler.transform(df[self.scale_cols])

        tensor = torch.tensor(df.values, dtype=torch.float32)

        with torch.no_grad():
            logit = self.model(tensor)
            prob: float = torch.sigmoid(logit).item()

        will_default = prob >= self.threshold

        if prob < 0.3:
            risk_level = "Low"
        elif prob <= 0.6:
            risk_level = "Medium"
        else:
            risk_level = "High"

        return {
            "default_probability": round(prob, 6),
            "will_default": will_default,
            "risk_level": risk_level,
            "threshold_used": self.threshold,
        }

    def get_model_info(self) -> dict:
        return self.model_info


model_service = ModelService()
