from fastapi import APIRouter, Depends, HTTPException
import httpx
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

ML_SERVICE_URL = "http://localhost:8001/api/v1"

@router.get("/risk")
async def get_student_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches the risk prediction for the current logged-in student.
    """
    # In a real app, query features (attendance, grades) from the DB
    features = {
        "attendance_rate": 0.85,
        "average_score": 72.5
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{ML_SERVICE_URL}/predict/risk",
                json={
                    "student_id": current_user.id,
                    "features": features
                },
                timeout=5.0
            )
            response.raise_for_status()
            data = response.json()
            return {
                "risk_tier": data.get("risk_tier"),
                "risk_score": data.get("risk_score"),
                "explanation": "Score is based on recent quiz performance."
            }
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"ML Service unavailable: {str(e)}")
