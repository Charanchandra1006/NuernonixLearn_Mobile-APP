from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User

router = APIRouter()

@router.get("/dashboard")
def get_admin_dashboard(db: Session = Depends(get_db)):
    # This would typically require an Admin user dependency check
    total_users = db.query(User).count()
    return {
        "status": "ok",
        "active_users": total_users,
        "high_risk_students": 1 # In real scenario, count RiskScore
    }
