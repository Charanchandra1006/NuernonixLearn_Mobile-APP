import asyncio
import os
import sys

# Add backend directory to sys path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.models.user import User
from app.models.profiles import StudentProfile, FacultyProfile
from app.models.academic import Subject, Topic, AcademicRecord, Attendance, TopicMastery, RiskScore
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def seed_db():
    db = SessionLocal()
    
    # Check if we already have users
    if db.query(User).first():
        print("Database already seeded. Skipping...")
        db.close()
        return

    print("Seeding database...")
    
    # Create Users
    student_user = User(
        email="test@student.com", 
        hashed_password=get_password_hash("password123"),
        role="student",
        first_name="Alice",
        last_name="Johnson"
    )
    faculty_user = User(
        email="test@faculty.com", 
        hashed_password=get_password_hash("password123"),
        role="faculty",
        first_name="Dr. Smith",
        last_name="Wesson"
    )
    admin_user = User(
        email="admin@admin.com", 
        hashed_password=get_password_hash("password123"),
        role="admin",
        first_name="System",
        last_name="Admin"
    )
    
    db.add(student_user)
    db.add(faculty_user)
    db.add(admin_user)
    db.commit()
    db.refresh(student_user)
    
    # Create Profiles
    student_profile = StudentProfile(user_id=student_user.id, enrollment_year=2023, major="Computer Science")
    faculty_profile = FacultyProfile(user_id=faculty_user.id, department="Computer Science")
    
    db.add(student_profile)
    db.add(faculty_profile)
    db.commit()
    db.refresh(student_profile)

    # Create Subject & Topics
    subject = Subject(name="Calculus I", code="MATH101")
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    topic1 = Topic(subject_id=subject.id, name="Derivatives")
    topic2 = Topic(subject_id=subject.id, name="Integrals")
    db.add(topic1)
    db.add(topic2)
    db.commit()

    # Create Academic Data
    record = AcademicRecord(student_id=student_profile.id, subject_id=subject.id, score=72.5, assessment_type="quiz")
    db.add(record)
    
    # 85% attendance
    for i in range(20):
        db.add(Attendance(student_id=student_profile.id, subject_id=subject.id, is_present=(i > 2)))

    # Mastery
    db.add(TopicMastery(student_id=student_profile.id, topic_id=topic1.id, mastery_score=0.6, attempt_count=2))
    
    # Risk Score
    risk = RiskScore(
        student_id=student_profile.id, 
        subject_id=subject.id, 
        score=0.75, 
        risk_tier="high",
        driver_factors=[{"factor": "quiz_performance", "direction": "down", "magnitude_pct": 12}]
    )
    db.add(risk)
    
    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
