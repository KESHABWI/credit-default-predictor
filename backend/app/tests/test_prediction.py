import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.model_service import model_service

client = TestClient(app)

@pytest.fixture
def valid_raw_input():
    return {
        "LIMIT_BAL": 200000.0,
        "SEX": 2,
        "EDUCATION": 2,
        "MARRIAGE": 2,
        "AGE": 35,
        "PAY_0": 0,
        "PAY_2": 0,
        "PAY_3": 0,
        "PAY_4": 0,
        "PAY_5": 0,
        "PAY_6": 0,
        "BILL_AMT1": 50000.0,
        "BILL_AMT2": 48000.0,
        "BILL_AMT3": 45000.0,
        "BILL_AMT4": 43000.0,
        "BILL_AMT5": 40000.0,
        "BILL_AMT6": 38000.0,
        "PAY_AMT1": 5000.0,
        "PAY_AMT2": 4800.0,
        "PAY_AMT3": 4500.0,
        "PAY_AMT4": 4300.0,
        "PAY_AMT5": 4000.0,
        "PAY_AMT6": 3800.0,
    }

def test_prediction_endpoint_success(valid_raw_input):
    response = client.post("/api/predict", json=valid_raw_input)
    assert response.status_code == 200
    
    data = response.json()
    assert "default_probability" in data
    assert "will_default" in data
    assert "risk_level" in data
    assert "threshold_used" in data
    
    assert isinstance(data["default_probability"], float)
    assert isinstance(data["will_default"], bool)
    assert data["risk_level"] in ["Low", "Medium", "High"]
    assert isinstance(data["threshold_used"], float)

def test_prediction_endpoint_invalid_input(valid_raw_input):
    # Remove a required raw feature
    invalid_input = valid_raw_input.copy()
    del invalid_input["LIMIT_BAL"]
    
    response = client.post("/api/predict", json=invalid_input)
    assert response.status_code == 422  # Validation error

def test_prediction_endpoint_wrong_type(valid_raw_input):
    # Pass an invalid string for SEX
    invalid_input = valid_raw_input.copy()
    invalid_input["SEX"] = "not-an-int"
    
    response = client.post("/api/predict", json=invalid_input)
    assert response.status_code == 422

def test_model_service_feature_engineering(valid_raw_input):
    # Retrieve model service outputs directly
    res_low_risk = model_service.predict(valid_raw_input)
    
    # Create a high risk input (severe payment delays)
    high_risk_input = valid_raw_input.copy()
    for col in ["PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6"]:
        high_risk_input[col] = 4  # 4 months delay
        
    res_high_risk = model_service.predict(high_risk_input)
    
    # High risk input should have higher probability and risk level
    assert res_high_risk["default_probability"] > res_low_risk["default_probability"]
    assert res_high_risk["risk_level"] in ["Medium", "High"]
