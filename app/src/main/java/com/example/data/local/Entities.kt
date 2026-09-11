package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "students")
data class StudentEntity(
    @PrimaryKey val studentId: String,
    val name: String,
    val enrollmentId: String,
    val cohort: String,
    val program: String,
    val isColdStart: Boolean = false,
    val targetExamDays: Int = 18
)

@Entity(tableName = "subjects")
data class SubjectEntity(
    @PrimaryKey val id: String,
    val name: String,
    val code: String,
    val department: String,
    val credits: Int,
    val currentPredictedScore: Double,
    val predictedRangeLow: Double,
    val predictedRangeHigh: Double,
    val riskTier: String, // "LOW", "MEDIUM", "HIGH"
    val confidence: String // "HIGH", "MEDIUM", "LOW", "COLD_START"
)

@Entity(tableName = "topics")
data class TopicEntity(
    @PrimaryKey val id: String,
    val subjectId: String,
    val parentTopicId: String?,
    val name: String,
    val difficultyBaseline: String
)

@Entity(tableName = "academic_records")
data class AcademicRecordEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val studentId: String,
    val subjectId: String,
    val recordType: String, // "internal", "assignment", "lab", "quiz", "previous_sem"
    val title: String,
    val value: Double,
    val maxValue: Double,
    val recordedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "attendance")
data class AttendanceEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val studentId: String,
    val subjectId: String,
    val percentage: Double,
    val totalClasses: Int,
    val attendedClasses: Int,
    val recordedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "topic_mastery")
data class TopicMasteryEntity(
    @PrimaryKey val id: String, // "$studentId-$topicId"
    val studentId: String,
    val topicId: String,
    val subjectId: String,
    val masteryScore: Double?, // null if not yet assessed
    val conceptUnderstanding: Double,
    val practiceAccuracy: Double,
    val revisionStability: Double,
    val classification: String, // "STRONG", "MODERATE", "WEAK", "NOT_YET_ASSESSED"
    val attemptsCount: Int,
    val lastUpdatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "predictions")
data class PredictionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val studentId: String,
    val subjectId: String, // "overall" or subject code
    val predictedRangeLow: Double,
    val predictedRangeHigh: Double,
    val confidence: String,
    val generatedAt: Long = System.currentTimeMillis(),
    val driverFactorsJson: String,
    val explanation: String,
    val isFlagged: Boolean = false,
    val flagReason: String? = null
)

@Entity(tableName = "risk_scores")
data class RiskScoreEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val studentId: String,
    val score: Double,
    val tier: String, // "LOW", "MEDIUM", "HIGH"
    val generatedAt: Long = System.currentTimeMillis(),
    val driverFactorsJson: String,
    val explanation: String
)

@Entity(tableName = "learning_plans")
data class LearningPlanEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val studentId: String,
    val weekLabel: String,
    val isStretchPlan: Boolean = false,
    val generatedAt: Long = System.currentTimeMillis(),
    val status: String = "active"
)

@Entity(tableName = "learning_plan_items")
data class LearningPlanItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val planId: Long,
    val dayOfWeek: String, // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
    val type: String, // "RESOURCE", "PRACTICE", "QUIZ", "REVISION"
    val topicId: String,
    val subjectId: String,
    val title: String,
    val estimatedMinutes: Int,
    val priorityRank: Int,
    val status: String = "PENDING" // "PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"
)

@Entity(tableName = "intervention_logs")
data class InterventionLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val studentId: String,
    val facultyId: String,
    val facultyName: String,
    val category: String,
    val note: String?,
    val loggedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "notifications")
data class NotificationEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val studentId: String,
    val type: String, // "risk_alert", "plan_reminder", "milestone"
    val title: String,
    val message: String,
    val isRead: Boolean = false,
    val sentAt: Long = System.currentTimeMillis()
)
