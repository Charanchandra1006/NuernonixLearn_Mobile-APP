from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.genai_provider import GenAIProvider, get_genai_provider

router = APIRouter()

class GenerateRequest(BaseModel):
    student_id: int
    context: str

class GenerateResponse(BaseModel):
    feedback: str

@router.post("/feedback", response_model=GenerateResponse)
def generate_personalized_feedback(
    request: GenerateRequest, 
    provider: GenAIProvider = Depends(get_genai_provider)
):
    """
    GenAI endpoint for feedback. SLA targets are looser here since it calls external LLMs.
    """
    try:
        # Prompt engineering based on context
        prompt = f"Provide actionable feedback for student {request.student_id} based on this context: {request.context}"
        feedback = provider.generate_feedback(prompt)
        
        return GenerateResponse(feedback=feedback)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
