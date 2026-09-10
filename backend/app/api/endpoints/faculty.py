from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.profiles import StudentProfile

router = APIRouter()

@router.get("/students")
def get_faculty_students(db: Session = Depends(get_db)):
    # Mocking a list of students for the dashboard
    students = db.query(StudentProfile).all()
    result = []
    for s in students:
        result.append({
            "id": s.id,
            "name": f"{s.user.first_name} {s.user.last_name}",
            "topic": "Calculus I",
            "score": "High Risk"
        })
    return result
