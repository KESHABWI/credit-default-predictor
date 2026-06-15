import joblib
import torch
import torch.nn as nn
import pandas as pd
from pathlib import Path

MODEL_DIR     = Path("/app/model")
ARTIFACTS_DIR = MODEL_DIR / "artifacts"
MODELS_DL_DIR = MODEL_DIR / "models" / "dl"
MODELS_ML_DIR = MODEL_DIR / "models" / "ml"

FEATURE_COLS = [
    "LIMIT_BAL", "SEX", "EDUCATION", "MARRIAGE", "AGE",
    "PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6",
    "BILL_AMT1", "BILL_AMT2", "BILL_AMT3", "BILL_AMT4", "BILL_AMT5", "BILL_AMT6",
    "PAY_AMT1", "PAY_AMT2", "PAY_AMT3", "PAY_AMT4", "PAY_AMT5", "PAY_AMT6",
    "util_rate", "avg_pay_delay", "max_consec_delay",
    "pay_ratio_1", "pay_ratio_2", "pay_ratio_3", "pay_ratio_4", "pay_ratio_5", "pay_ratio_6",
    "bill_trend", "total_bill", "total_payment", "payment_gap", "zero_pay_months", "age_group",
]

TOP_FEATURES = [
    "max_consec_delay", "avg_pay_delay", "PAY_0", "LIMIT_BAL",
    "EDUCATION", "AGE", "zero_pay_months", "util_rate",
    "total_payment", "SEX", "PAY_2",
]

# ─── Model registry metadata ───────────────────────────────────────────────────

MODEL_REGISTRY: dict[str, dict] = {
    "simple_mlp": {
        "display_name": "SimpleMLP",
        "type": "Deep Learning",
        "file": MODELS_DL_DIR / "BEST_MODEL_SimpleMLP.pt",
        "framework": "pytorch",
        "threshold": 0.55,
        "metrics": {"roc_auc": 0.7666, "recall": 0.8499, "precision": 0.3016, "f1": 0.4452},
    },
    "complex_mlp": {
        "display_name": "ComplexMLP",
        "type": "Deep Learning",
        "file": MODELS_DL_DIR / "ComplexMLP_tuned.pt",
        "framework": "pytorch",
        "threshold": 0.61,
        "metrics": {"roc_auc": 0.7148, "recall": 0.6591, "precision": 0.3553, "f1": 0.4617},
    },
    "lightgbm": {
        "display_name": "LightGBM",
        "type": "Machine Learning",
        "file": MODELS_ML_DIR / "BEST_F1_LightGBM.pkl",
        "framework": "sklearn",
        "threshold": 0.30,
        "metrics": {"roc_auc": 0.769, "recall": 0.7029, "precision": 0.3843, "f1": 0.4969},
    },
    "xgboost": {
        "display_name": "XGBoost",
        "type": "Machine Learning",
        "file": MODELS_ML_DIR / "XGBoost_tuned.pkl",
        "framework": "sklearn",
        "threshold": 0.30,
        "metrics": {"roc_auc": 0.77, "recall": 0.9683, "precision": 0.2429, "f1": 0.3883},
    },
    "catboost": {
        "display_name": "CatBoost",
        "type": "Machine Learning",
        "file": MODELS_ML_DIR / "CatBoost_tuned.pkl",
        "framework": "sklearn",
        "threshold": 0.30,
        "metrics": {"roc_auc": 0.7737, "recall": 0.7157, "precision": 0.3704, "f1": 0.4882},
    },
    "random_forest": {
        "display_name": "Random Forest",
        "type": "Machine Learning",
        "file": MODELS_ML_DIR / "RandomForest_tuned.pkl",
        "framework": "sklearn",
        "threshold": 0.30,
        "metrics": {"roc_auc": 0.7722, "recall": 0.8009, "precision": 0.3347, "f1": 0.4721},
    },
    "logistic": {
        "display_name": "Logistic Regression",
        "type": "Machine Learning",
        "file": MODELS_ML_DIR / "LogisticRegression_tuned.pkl",
        "framework": "sklearn",
        "threshold": 0.30,
        "metrics": {"roc_auc": 0.7469, "recall": 0.9374, "precision": 0.2475, "f1": 0.3916},
    },
}

# ─── PyTorch architectures ────────────────────────────────────────────────────


class SimpleMLP(nn.Module):
    def __init__(self, input_dim: int, hidden_dims: tuple = (256, 128)):
        super().__init__()
        layers = []
        in_dim = input_dim
        for hidden_dim in hidden_dims:
            layers.extend([
                nn.Linear(in_dim, hidden_dim),
                nn.BatchNorm1d(hidden_dim),
                nn.ReLU(),
                nn.Dropout(0.3),
            ])
            in_dim = hidden_dim
        layers.append(nn.Linear(in_dim, 1))
        self.net = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class FeatureAttentionGate(nn.Module):
    """Soft attention over input features — learns which matter most."""
    def __init__(self, n_features: int):
        super().__init__()
        self.gate = nn.Sequential(
            nn.Linear(n_features, n_features * 2),
            nn.ReLU(),
            nn.Linear(n_features * 2, n_features),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x * self.gate(x)


class ResidualBlock(nn.Module):
    """Residual block: x → (Linear → BN → GELU → Dropout → Linear → BN) + x"""
    def __init__(self, dim: int, dropout_rate: float = 0.3):
        super().__init__()
        self.block = nn.Sequential(
            nn.Linear(dim, dim * 2),
            nn.BatchNorm1d(dim * 2),
            nn.GELU(),
            nn.Dropout(dropout_rate),
            nn.Linear(dim * 2, dim),
            nn.BatchNorm1d(dim),
        )
        self.act = nn.GELU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.act(x + self.block(x))


class ComplexMLP(nn.Module):
    """
    Complex MLP:
      FeatureAttentionGate → Linear projection → N × ResidualBlock → Head
    More expressive than SimpleMLP, captures non-linear feature interactions.
    """
    def __init__(self, n_features: int, hidden_dim: int = 256, n_blocks: int = 4, dropout_rate: float = 0.3):
        super().__init__()

        self.attention = FeatureAttentionGate(n_features)

        self.input_proj = nn.Sequential(
            nn.Linear(n_features, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout_rate * 0.5),
        )

        self.res_blocks = nn.Sequential(*[
            ResidualBlock(hidden_dim, dropout_rate) for _ in range(n_blocks)
        ])

        self.head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.GELU(),
            nn.Dropout(dropout_rate),
            nn.Linear(hidden_dim // 2, hidden_dim // 4),
            nn.GELU(),
            nn.Dropout(dropout_rate * 0.5),
            nn.Linear(hidden_dim // 4, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.attention(x)
        x = self.input_proj(x)
        x = self.res_blocks(x)
        return self.head(x)


# ─── Helpers ──────────────────────────────────────────────────────────────────


def _load_simple_mlp(path: Path) -> tuple[nn.Module, float, list[str]]:
    """Load a SimpleMLP checkpoint → (model, threshold, feature_cols)."""
    ckpt = torch.load(path, map_location="cpu", weights_only=False)
    state_dict = ckpt["model_state_dict"]
    linear_weights = [
        v for k, v in state_dict.items()
        if "weight" in k and len(v.shape) == 2
    ]
    hidden_dims = tuple(w.shape[0] for w in linear_weights[:-1])
    model = SimpleMLP(input_dim=ckpt["n_features"], hidden_dims=hidden_dims)
    model.load_state_dict(state_dict)
    model.eval()
    threshold = float(ckpt.get("threshold", 0.55))
    feature_cols: list[str] = ckpt.get("feature_cols", FEATURE_COLS)
    return model, threshold, feature_cols


def _load_complex_mlp(path: Path) -> tuple[nn.Module, float, list[str]]:
    """Load a ComplexMLP checkpoint by inferring dims from weight shapes."""
    ckpt = torch.load(path, map_location="cpu", weights_only=False)
    sd = ckpt["model_state_dict"]

    input_dim = int(sd["attention.gate.0.weight"].shape[1])
    hidden_dim = int(sd["input_proj.0.weight"].shape[0])
    n_blocks = len([k for k in sd if k.endswith(".block.0.weight")])

    model = ComplexMLP(
        n_features=input_dim,
        hidden_dim=hidden_dim,
        n_blocks=n_blocks,
    )
    model.load_state_dict(sd)
    model.eval()
    threshold = float(ckpt.get("threshold", 0.55))
    feature_cols: list[str] = ckpt.get("feature_cols", FEATURE_COLS)
    return model, threshold, feature_cols


# ─── Service ──────────────────────────────────────────────────────────────────


class ModelService:
    def __init__(self):
        self.scaler = joblib.load(ARTIFACTS_DIR / "robust_scaler.pkl")
        self.outlier_bounds: dict = joblib.load(ARTIFACTS_DIR / "outlier_bounds.pkl")

        # Load all models eagerly
        self._models: dict[str, object] = {}
        self._thresholds: dict[str, float] = {}
        self._feature_cols: dict[str, list[str]] = {}

        for key, meta in MODEL_REGISTRY.items():
            path: Path = meta["file"]
            if not path.exists():
                continue
            if meta["framework"] == "pytorch":
                loader = _load_complex_mlp if key == "complex_mlp" else _load_simple_mlp
                model, threshold, feature_cols = loader(path)
                self._models[key] = model
                self._thresholds[key] = threshold
                self._feature_cols[key] = feature_cols
            else:
                loaded_obj = joblib.load(path)
                if isinstance(loaded_obj, dict) and "model" in loaded_obj:
                    self._models[key] = loaded_obj["model"]
                    self._thresholds[key] = loaded_obj.get("threshold", meta["threshold"])
                    self._feature_cols[key] = loaded_obj.get("features", FEATURE_COLS)
                else:
                    self._models[key] = loaded_obj
                    self._thresholds[key] = meta["threshold"]
                    self._feature_cols[key] = FEATURE_COLS

        # Build serialisable registry (no Path objects)
        self._registry_info: dict = {
            key: {
                "display_name": meta["display_name"],
                "type": meta["type"],
                "threshold": self._thresholds.get(key, meta["threshold"]),
                "metrics": meta["metrics"],
                "loaded": key in self._models,
            }
            for key, meta in MODEL_REGISTRY.items()
        }

    # ── Feature engineering ────────────────────────────────────────────────────

    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        pay_cols     = ["PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6"]
        bill_cols    = [f"BILL_AMT{i}" for i in range(1, 7)]
        pay_amt_cols = [f"PAY_AMT{i}" for i in range(1, 7)]

        df["util_rate"]       = (df["BILL_AMT1"] / (df["LIMIT_BAL"] + 1)).clip(0, 2)
        df["avg_pay_delay"]   = df[pay_cols].mean(axis=1)
        df["max_consec_delay"] = df[pay_cols].clip(lower=0).max(axis=1)

        for i in range(1, 7):
            df[f"pay_ratio_{i}"] = (
                df[f"PAY_AMT{i}"] / (df[f"BILL_AMT{i}"].abs() + 1)
            ).clip(0, 5)

        df["bill_trend"]    = df["BILL_AMT1"] - df["BILL_AMT6"]
        df["total_bill"]    = df[bill_cols].sum(axis=1)
        df["total_payment"] = df[pay_amt_cols].sum(axis=1)
        df["payment_gap"]   = df["total_bill"] - df["total_payment"]
        df["zero_pay_months"] = (df[pay_amt_cols] == 0).sum(axis=1).astype(float)
        df["age_group"] = pd.cut(
            df["AGE"],
            bins=[0, 25, 35, 45, 55, 100],
            labels=[0, 1, 2, 3, 4],
        ).astype(float)

        return df

    def _prepare_df(self, raw_input: dict, feature_cols: list[str]) -> object:
        """Engineer, clip, reorder, and scale features. Returns numpy array."""
        df = pd.DataFrame([raw_input])
        df = self._engineer_features(df)

        for col, (lower, upper) in self.outlier_bounds.items():
            if col in df.columns:
                df[col] = df[col].clip(lower, upper)

        df = df[feature_cols]
        return self.scaler.transform(df)

    # ── Prediction ─────────────────────────────────────────────────────────────

    def predict(self, raw_input: dict, model_key: str = "simple_mlp") -> dict:
        if model_key not in self._models:
            available = ", ".join(self._models.keys())
            raise ValueError(
                f"Model '{model_key}' not loaded. Available: {available}"
            )

        meta = MODEL_REGISTRY[model_key]
        threshold = self._thresholds[model_key]
        feature_cols = self._feature_cols[model_key]
        scaled = self._prepare_df(raw_input, feature_cols)

        if meta["framework"] == "pytorch":
            model: nn.Module = self._models[model_key]  # type: ignore[assignment]
            tensor = torch.tensor(scaled, dtype=torch.float32)
            with torch.no_grad():
                logit = model(tensor)
                prob: float = torch.sigmoid(logit).item()
        else:
            sklearn_model = self._models[model_key]
            prob = float(sklearn_model.predict_proba(scaled)[0][1])

        will_default = prob >= threshold

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
            "threshold_used": threshold,
            "model_used": meta["display_name"],
        }

    def get_model_info(self) -> dict:
        """Return info for the default (simple_mlp) model."""
        return {
            "model_name": "SimpleMLP",
            "model_type": "Deep Learning",
            "input_dim": len(FEATURE_COLS),
            "hidden_dims": [256, 128],
            "decision_threshold": self._thresholds.get("simple_mlp", 0.55),
            "scaler": "RobustScaler",
            "features": FEATURE_COLS,
            "top_features": TOP_FEATURES,
            "metrics": MODEL_REGISTRY["simple_mlp"]["metrics"],
        }

    def get_models_registry(self) -> dict:
        """Return the full registry of all available models."""
        return self._registry_info


model_service = ModelService()
