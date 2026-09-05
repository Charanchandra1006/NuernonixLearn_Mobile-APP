from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    name = Column(String, nullable=False)
    
    subject = relationship("Subject", backref="topics")

class AcademicRecord(Base):
    __tablename__ = "academic_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    
    # Internal exam marks, assignments, etc.
    score = Column(Float)
    assessment_type = Column(String) # 'quiz', 'midterm', 'assignment'
    recorded_at = Column(DateTime(timezone=True), default=func.now())

class Attendance(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    date = Column(DateTime(timezone=True), default=func.now())
    is_present = Column(Boolean, default=True)

class TopicMastery(Base):
    __tablename__ = "topic_mastery"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    
    mastery_score = Column(Float, nullable=True) # None if not assessed
    last_assessed = Column(DateTime(timezone=True))
    
    # Track historical attempts to decay mastery over time
    attempt_count = Column(Integer, default=0)

class RiskScore(Base):
    __tablename__ = "risk_scores"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True) # Global if null
    
    score = Column(Float, nullable=False)
    risk_tier = Column(String) # 'low', 'medium', 'high'
    
    # Use JSONB to store driver factors flexibly
    # e.g. [{"factor": "quiz_performance", "direction": "down", "magnitude_pct": 12}]
    driver_factors = Column(JSONB, nullable=True)
    
    calculated_at = Column(DateTime(timezone=True), default=func.now())
