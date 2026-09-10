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
from app.models.academic import AcademicRecord, Attendance

    # Query real features from the database
    records = db.query(AcademicRecord).filter(AcademicRecord.student_id == current_user.student_profile[0].id).all()
    attendance_records = db.query(Attendance).filter(Attendance.student_id == current_user.student_profile[0].id).all()
    
    avg_score = sum([r.score for r in records]) / len(records) if records else 0
    attendance_rate = sum([1 for a in attendance_records if a.is_present]) / len(attendance_records) if attendance_records else 0

    features = {
        "attendance_rate": attendance_rate,
        "average_score": avg_score
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
