from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.database import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Academic meta
    enrollment_year = Column(Integer)
    major = Column(String)
    
    user = relationship("User", backref="student_profile")
    
class FacultyProfile(Base):
    __tablename__ = "faculty_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    department = Column(String)
    
    user = relationship("User", backref="faculty_profile")
