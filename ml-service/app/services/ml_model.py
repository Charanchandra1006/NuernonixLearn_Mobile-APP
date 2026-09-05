import random

def mock_predict_risk(features: dict) -> dict:
    """
    Mock XGBoost prediction function.
    In a real scenario, this would load a saved .xgb model 
    and call model.predict(xgb.DMatrix(data))
    """
    # Simulate processing time (should be very fast)
    import time
    time.sleep(0.05)
    
    score = random.uniform(0, 100)
    
    if score > 75:
        tier = "high"
    elif score > 40:
        tier = "medium"
    else:
        tier = "low"
        
    return {
        "score": round(score, 2),
        "tier": tier
    }
