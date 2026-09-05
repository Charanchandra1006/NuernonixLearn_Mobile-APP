from fastapi import APIRouter
from app.api.endpoints import tutor, predictions

api_router = APIRouter()
api_router.include_router(tutor.router, prefix="/tutor", tags=["tutor"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
