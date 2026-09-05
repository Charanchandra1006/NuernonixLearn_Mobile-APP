from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    # The hashed password
    hashed_password = Column(String, nullable=False)
    
    # Role-Based Access Control
    role = Column(String, default="student", nullable=False) # 'student', 'faculty', 'admin'
    
    # Privacy / Masking for PII
    # We will encrypt real names if needed, or just store a masked alias
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
