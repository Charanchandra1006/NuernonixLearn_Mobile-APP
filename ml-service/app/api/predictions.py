from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import time
from app.services.ml_model import mock_predict_risk

router = APIRouter()

class PredictionRequest(BaseModel):
    student_id: int
    features: dict

class PredictionResponse(BaseModel):
    student_id: int
    risk_tier: str
    risk_score: float
    latency_ms: float

@router.post("/risk", response_model=PredictionResponse)
def predict_student_risk(request: PredictionRequest):
    """
    Fast <2s prediction API separated from GenAI.
    """
    start_time = time.time()
    
    try:
        # For now, use mock XGBoost model prediction
        result = mock_predict_risk(request.features)
        
        latency = (time.time() - start_time) * 1000
        
        # Ensure we meet SLA < 2000ms
        if latency > 2000:
            print(f"WARNING: Prediction took {latency}ms, exceeding 2s SLA")
            
        return PredictionResponse(
            student_id=request.student_id,
            risk_tier=result["tier"],
            risk_score=result["score"],
            latency_ms=latency
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
