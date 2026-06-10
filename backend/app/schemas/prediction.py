from pydantic import BaseModel, ConfigDict


class PredictionRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
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
        }
    )

    LIMIT_BAL: float
    SEX: int
    EDUCATION: int
    MARRIAGE: int
    AGE: int
    PAY_0: int
    PAY_2: int
    PAY_3: int
    PAY_4: int
    PAY_5: int
    PAY_6: int
    BILL_AMT1: float
    BILL_AMT2: float
    BILL_AMT3: float
    BILL_AMT4: float
    BILL_AMT5: float
    BILL_AMT6: float
    PAY_AMT1: float
    PAY_AMT2: float
    PAY_AMT3: float
    PAY_AMT4: float
    PAY_AMT5: float
    PAY_AMT6: float



class PredictionResponse(BaseModel):
    default_probability: float
    will_default: bool
    risk_level: str  # "Low" | "Medium" | "High"
    threshold_used: float
