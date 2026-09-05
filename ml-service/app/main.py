from fastapi import FastAPI
from app.api import predictions
from app.api import generate

app = FastAPI(title="LearnSense ML Service")

app.include_router(predictions.router, prefix="/api/v1/predict", tags=["Predictions"])
app.include_router(generate.router, prefix="/api/v1/generate", tags=["GenAI"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ml-service"}
