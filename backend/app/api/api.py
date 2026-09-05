from fastapi import APIRouter
from app.api.endpoints import tutor

api_router = APIRouter()
api_router.include_router(tutor.router, prefix="/tutor", tags=["tutor"])
