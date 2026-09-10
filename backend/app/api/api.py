from fastapi import APIRouter
from app.api.endpoints import tutor, predictions, login, admin, faculty

api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(faculty.router, prefix="/faculty", tags=["faculty"])
api_router.include_router(tutor.router, prefix="/tutor", tags=["tutor"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
