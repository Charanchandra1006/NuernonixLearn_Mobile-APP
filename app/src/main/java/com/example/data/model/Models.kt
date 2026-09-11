package com.example.data.model

enum class RiskTier(val label: String) {
    LOW("Low Risk"),
    MEDIUM("Moderate Risk"),
    HIGH("High Risk")
}

enum class MasteryClassification(val label: String) {
    STRONG("Strong"),
    MODERATE("Moderate"),
    WEAK("Needs Attention"),
    NOT_YET_ASSESSED("Not Yet Assessed")
}

enum class ConfidenceLevel(val label: String) {
    HIGH("High Confidence"),
    MEDIUM("Medium Confidence"),
    LOW("Low Confidence"),
    COLD_START("Preliminary (Cold-Start)")
}

enum class PlanItemType(val label: String) {
    RESOURCE("Study Concept"),
    PRACTICE("Practice Exercise"),
    QUIZ("Adaptive Quiz"),
    REVISION("Spaced Revision")
}

enum class PlanItemStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    SKIPPED
}

enum class QuestionDifficulty {
    EASY,
    MEDIUM,
    HARD
}

enum class InterventionCategory(val label: String) {
    MET_WITH_STUDENT("1-on-1 Academic Advising"),
    EXTENDED_DEADLINE("Extended Assignment Deadline"),
    REFERRED_TO_COUNSELING("Referred to Student Support"),
    ASSIGNED_EXTRA_PRACTICE("Assigned Curated Practice Set"),
    OTHER("Other Academic Intervention")
}

enum class UserRole(val label: String) {
    STUDENT("Student View"),
    FACULTY("Faculty View"),
    ADMIN("Admin Console")
}

data class DriverFactor(
    val factorName: String,
    val direction: String, // "up" or "down"
    val magnitudePct: Int,
    val description: String
)

data class TopicMasterySummary(
    val topicId: String,
    val topicName: String,
    val subjectId: String,
    val subjectName: String,
    val masteryScore: Double?,
    val conceptUnderstanding: Double,
    val practiceAccuracy: Double,
    val revisionStability: Double,
    val classification: MasteryClassification,
    val attemptsCount: Int
)

data class AcademicHealthSummary(
    val compositeHealthScore: Int, // 0 - 100
    val predictedSemesterAverage: Double, // e.g. 74.5%
    val predictedRangeLow: Double,
    val predictedRangeHigh: Double,
    val confidence: ConfidenceLevel,
    val overallRiskScore: Double,
    val overallRiskTier: RiskTier,
    val topicsMasteredCount: Int,
    val topicsWeakCount: Int,
    val totalTopicsCount: Int,
    val primaryDriverExplanation: String,
    val attendanceAverage: Double,
    val weeklyStudyHours: Double,
    val isColdStart: Boolean
)

data class QuizQuestion(
    val id: String,
    val subjectId: String,
    val topicId: String,
    val topicName: String,
    val difficulty: QuestionDifficulty,
    val text: String,
    val options: List<String>,
    val correctAnswerIndex: Int,
    val explanation: String,
    val conceptReview: String
)

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val sender: String, // "user" or "learnsense_ai"
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isSuggestedAction: Boolean = false,
    val relatedTopicId: String? = null
)
