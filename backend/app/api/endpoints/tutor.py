from fastapi import APIRouter, Depends, HTTPException
import httpx
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

class TutorRequest(BaseModel):
    topic: str
    question: str

class TutorResponse(BaseModel):
    feedback: str

# Configured to hit our separated ML/GenAI microservice
ML_SERVICE_URL = "http://localhost:8001/api/v1"

@router.post("/ask", response_model=TutorResponse)
async def ask_tutor(
    request: TutorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Connects to the ML-Service GenAI abstraction.
    We proxy the request to the ML service to keep AI workloads separated.
    """
    # Context injected from DB (e.g. past mastery, learning style)
    context = f"Topic: {request.topic}. Question: {request.question}. Student Level: intermediate."
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{ML_SERVICE_URL}/generate/feedback",
                json={
                    "student_id": current_user.id,
                    "context": context
                },
                timeout=10.0 # GenAI can take a bit longer
            )
            response.raise_for_status()
            data = response.json()
            return TutorResponse(feedback=data.get("feedback", ""))
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"AI Service unavailable: {str(e)}")
