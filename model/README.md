# Model

Place trained model artifacts here.

## Expected contents

| File | Description |
|------|-------------|
| `model.pt` | Serialized PyTorch state dict |
| `preprocessor.pkl` | Fitted scikit-learn preprocessing pipeline |
| `metadata.json` | Training metadata (feature names, threshold, MLflow run ID) |

## Training

Run training scripts from the project root. Trained models are automatically logged to MLflow and can be loaded via the `model_service`.
