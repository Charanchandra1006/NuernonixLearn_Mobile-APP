package com.example.data.repository

import com.example.data.local.*
import com.example.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.flow
import org.json.JSONArray
import org.json.JSONObject

class LearnSenseRepository(private val database: AppDatabase) {

    private val studentDao = database.studentDao()
    private val subjectDao = database.subjectDao()
    private val topicDao = database.topicDao()
    private val recordDao = database.academicRecordDao()
    private val attendanceDao = database.attendanceDao()
    private val masteryDao = database.topicMasteryDao()
    private val predictionDao = database.predictionDao()
    private val riskScoreDao = database.riskScoreDao()
    private val planDao = database.learningPlanDao()
    private val interventionDao = database.interventionLogDao()
    private val notificationDao = database.notificationDao()

    var activeStudentId: String = "rahul_001"

    suspend fun initializeDatabase() {
        val existingStudents = studentDao.getAllStudents().first()
        if (existingStudents.isEmpty()) {
            seedInitialData()
        }
    }

    private suspend fun seedInitialData() {
        // 1. Students
        val students = listOf(
            StudentEntity(
                studentId = "rahul_001",
                name = "Rahul Sharma",
                enrollmentId = "ENR-2024-8842",
                cohort = "Section B (2nd Year)",
                program = "B.Tech Computer Science",
                isColdStart = false,
                targetExamDays = 18
            ),
            StudentEntity(
                studentId = "priya_002",
                name = "Priya Patel",
                enrollmentId = "ENR-2024-8890",
                cohort = "Section A (2nd Year)",
                program = "B.Tech Computer Science",
                isColdStart = false,
                targetExamDays = 18
            ),
            StudentEntity(
                studentId = "alex_003",
                name = "Alex Chen",
                enrollmentId = "ENR-2024-9104",
                cohort = "Section B (2nd Year)",
                program = "B.Tech Computer Science",
                isColdStart = true,
                targetExamDays = 24
            )
        )
        studentDao.insertStudents(students)

        // 2. Subjects
        val subjects = listOf(
            SubjectEntity(
                id = "math_201",
                name = "Engineering Mathematics",
                code = "MATH201",
                department = "Mathematics",
                credits = 4,
                currentPredictedScore = 63.5,
                predictedRangeLow = 58.0,
                predictedRangeHigh = 69.0,
                riskTier = "HIGH",
                confidence = "HIGH"
            ),
            SubjectEntity(
                id = "cs_202",
                name = "Data Structures & Algorithms",
                code = "CS202",
                department = "Computer Science",
                credits = 4,
                currentPredictedScore = 74.0,
                predictedRangeLow = 70.0,
                predictedRangeHigh = 78.0,
                riskTier = "MEDIUM",
                confidence = "HIGH"
            ),
            SubjectEntity(
                id = "cs_203",
                name = "Operating Systems",
                code = "CS203",
                department = "Computer Science",
                credits = 3,
                currentPredictedScore = 81.0,
                predictedRangeLow = 77.0,
                predictedRangeHigh = 85.0,
                riskTier = "LOW",
                confidence = "HIGH"
            )
        )
        subjectDao.insertSubjects(subjects)

        // 3. Topics
        val topics = listOf(
            TopicEntity("math_prob", "math_201", null, "Probability & Statistics", "medium"),
            TopicEntity("math_calc", "math_201", null, "Calculus & Integration", "hard"),
            TopicEntity("math_matrices", "math_201", null, "Matrices & Linear Algebra", "medium"),
            TopicEntity("math_diff", "math_201", null, "Differential Equations", "hard"),
            TopicEntity("cs_trees", "cs_202", null, "Binary Trees & BST", "medium"),
            TopicEntity("cs_graphs", "cs_202", null, "Graph Algorithms (BFS/DFS)", "hard"),
            TopicEntity("cs_dp", "cs_202", null, "Dynamic Programming", "hard"),
            TopicEntity("os_mem", "cs_203", null, "Virtual Memory & Paging", "medium"),
            TopicEntity("os_sync", "cs_203", null, "Process Synchronization", "hard"),
            TopicEntity("os_sched", "cs_203", null, "CPU Scheduling", "easy")
        )
        topicDao.insertTopics(topics)

        // 4. Topic Mastery for Rahul
        val rahulMastery = listOf(
            TopicMasteryEntity("rahul_001-math_prob", "rahul_001", "math_prob", "math_201", 44.0, 42.0, 45.0, 48.0, "WEAK", 6),
            TopicMasteryEntity("rahul_001-math_calc", "rahul_001", "math_calc", "math_201", 48.0, 50.0, 46.0, 50.0, "WEAK", 5),
            TopicMasteryEntity("rahul_001-math_matrices", "rahul_001", "math_matrices", "math_201", 84.0, 85.0, 88.0, 80.0, "STRONG", 12),
            TopicMasteryEntity("rahul_001-math_diff", "rahul_001", "math_diff", "math_201", null, 0.0, 0.0, 0.0, "NOT_YET_ASSESSED", 0),
            TopicMasteryEntity("rahul_001-cs_trees", "rahul_001", "cs_trees", "cs_202", 72.0, 75.0, 70.0, 72.0, "MODERATE", 8),
            TopicMasteryEntity("rahul_001-cs_graphs", "rahul_001", "cs_graphs", "cs_202", 64.0, 60.0, 68.0, 65.0, "MODERATE", 7),
            TopicMasteryEntity("rahul_001-cs_dp", "rahul_001", "cs_dp", "cs_202", 52.0, 50.0, 55.0, 50.0, "MODERATE", 6),
            TopicMasteryEntity("rahul_001-os_mem", "rahul_001", "os_mem", "cs_203", 82.0, 85.0, 80.0, 82.0, "STRONG", 9),
            TopicMasteryEntity("rahul_001-os_sync", "rahul_001", "os_sync", "cs_203", 76.0, 78.0, 75.0, 76.0, "STRONG", 8),
            TopicMasteryEntity("rahul_001-os_sched", "rahul_001", "os_sched", "cs_203", 88.0, 90.0, 87.0, 86.0, "STRONG", 10)
        )
        masteryDao.insertAllMastery(rahulMastery)

        // 5. Attendance for Rahul
        attendanceDao.insertAttendances(listOf(
            AttendanceEntity(0, "rahul_001", "math_201", 78.0, 36, 28),
            AttendanceEntity(0, "rahul_001", "cs_202", 84.0, 38, 32),
            AttendanceEntity(0, "rahul_001", "cs_203", 92.0, 30, 28)
        ))

        // 6. Academic Records for Rahul
        recordDao.insertRecords(listOf(
            AcademicRecordEntity(0, "rahul_001", "math_201", "internal", "Midterm 1 (Calculus & Matrices)", 18.0, 30.0),
            AcademicRecordEntity(0, "rahul_001", "math_201", "quiz", "Quiz 1: Probability Basics", 8.0, 20.0),
            AcademicRecordEntity(0, "rahul_001", "math_201", "assignment", "Assignment 2: Linear Systems", 24.0, 25.0),
            AcademicRecordEntity(0, "rahul_001", "cs_202", "internal", "Midterm 1: Trees & Graphs", 23.0, 30.0),
            AcademicRecordEntity(0, "rahul_001", "cs_202", "assignment", "Assignment 1: BST Implementations", 19.0, 20.0),
            AcademicRecordEntity(0, "rahul_001", "cs_203", "internal", "Midterm 1: Process Management", 27.0, 30.0)
        ))

        // 7. Prediction for Rahul
        val driverFactorsRahul = JSONArray().apply {
            put(JSONObject().apply {
                put("factorName", "Probability & Statistics Mastery (44%)")
                put("direction", "down")
                put("magnitudePct", 14)
                put("description", "Low score on foundational probability concepts reduces mid-term ceiling.")
            })
            put(JSONObject().apply {
                put("factorName", "Calculus & Integration Mastery (48%)")
                put("direction", "down")
                put("magnitudePct", 11)
                put("description", "Inconsistent quiz performance on integration methods.")
            })
            put(JSONObject().apply {
                put("factorName", "Attendance Margin (78%)")
                put("direction", "down")
                put("magnitudePct", 8)
                put("description", "Near institutional attendance cutoff of 75%.")
            })
            put(JSONObject().apply {
                put("factorName", "Matrices & Linear Algebra Mastery (84%)")
                put("direction", "up")
                put("magnitudePct", 15)
                put("description", "Strong matrix algebraic skill provides solid base score.")
            })
        }.toString()

        predictionDao.insertPrediction(
            PredictionEntity(
                studentId = "rahul_001",
                subjectId = "overall",
                predictedRangeLow = 62.0,
                predictedRangeHigh = 70.0,
                confidence = "HIGH",
                driverFactorsJson = driverFactorsRahul,
                explanation = "Quiz and assignment performance in Probability & Statistics (-14%) and attendance at 78% (-8%) are pulling your trajectory down. Strong mastery in Matrices (+15%) keeps you competitive."
            )
        )

        // 8. Risk Score for Rahul
        val riskFactorsRahul = JSONArray().apply {
            put(JSONObject().apply {
                put("factorName", "Weak Topic Concentration (20% weak)")
                put("direction", "down")
                put("magnitudePct", 32)
                put("description", "2 core topics in Math 201 are below the 45% mastery threshold.")
            })
            put(JSONObject().apply {
                put("factorName", "Attendance at 78%")
                put("direction", "down")
                put("magnitudePct", 24)
                put("description", "Attendance is 3% away from mandatory cutoff.")
            })
            put(JSONObject().apply {
                put("factorName", "Assessment Proximity")
                put("direction", "down")
                put("magnitudePct", 18)
                put("description", "Final exams begin in 18 days.")
            })
        }.toString()

        riskScoreDao.insertRiskScore(
            RiskScoreEntity(
                studentId = "rahul_001",
                score = 73.5,
                tier = "HIGH",
                driverFactorsJson = riskFactorsRahul,
                explanation = "Your academic risk is currently High (73.5). Focus on Probability & Integration during the next 14 days to stabilize your score before internal assessments."
            )
        )

        // 9. Learning Plan for Rahul
        val planId = planDao.insertPlan(
            LearningPlanEntity(
                studentId = "rahul_001",
                weekLabel = "Week 6: Targeted Recovery Plan",
                isStretchPlan = false,
                status = "active"
            )
        )

        val planItems = listOf(
            LearningPlanItemEntity(0, planId, "Mon", "RESOURCE", "math_prob", "math_201", "Bayes' Theorem Visual Explainer", 25, 1, "COMPLETED"),
            LearningPlanItemEntity(0, planId, "Mon", "PRACTICE", "math_prob", "math_201", "8 Practice Problems: Conditional Probability", 30, 2, "PENDING"),
            LearningPlanItemEntity(0, planId, "Tue", "QUIZ", "math_prob", "math_201", "Adaptive Mini-Quiz: Probability Distributions", 20, 3, "PENDING"),
            LearningPlanItemEntity(0, planId, "Wed", "RESOURCE", "math_calc", "math_201", "Integration by Parts & Substitution Techniques", 30, 4, "PENDING"),
            LearningPlanItemEntity(0, planId, "Thu", "PRACTICE", "math_calc", "math_201", "Calculus Problem Set 3", 35, 5, "PENDING"),
            LearningPlanItemEntity(0, planId, "Fri", "REVISION", "math_matrices", "math_201", "Spaced Recall: Eigenvalues & Vectors", 20, 6, "PENDING"),
            LearningPlanItemEntity(0, planId, "Sat", "QUIZ", "math_201", "math_201", "Full Subject Diagnostic Simulation", 45, 7, "PENDING")
        )
        planDao.insertPlanItems(planItems)

        // 10. Initial Notifications
        notificationDao.insertNotification(
            NotificationEntity(
                studentId = "rahul_001",
                type = "risk_alert",
                title = "High Risk Alert: Engineering Mathematics",
                message = "Your predicted score has shifted to 62-70%. We've created a targeted study plan for Probability & Integration.",
                isRead = false
            )
        )
        notificationDao.insertNotification(
            NotificationEntity(
                studentId = "rahul_001",
                type = "plan_reminder",
                title = "Today's Study Plan Ready",
                message = "Complete your 30-minute practice exercise on Conditional Probability to boost topic mastery.",
                isRead = false
            )
        )
        notificationDao.insertNotification(
            NotificationEntity(
                studentId = "rahul_001",
                type = "milestone",
                title = "Mastery Milestone Achieved!",
                message = "Matrices & Linear Algebra is now verified at Strong (84%). Great work!",
                isRead = true
            )
        )

        // 11. Initial Intervention Log by Faculty Dr. Iyer
        interventionDao.insertIntervention(
            InterventionLogEntity(
                studentId = "rahul_001",
                facultyId = "fac_iyer",
                facultyName = "Dr. R. Iyer",
                category = "MET_WITH_STUDENT",
                note = "Discussed attendance concerns and advised focusing on tutorial sheets 4 & 5 for probability."
            )
        )
    }

    fun getAllStudents(): Flow<List<StudentEntity>> = studentDao.getAllStudents()

    suspend fun getActiveStudent(): StudentEntity? {
        return studentDao.getStudent(activeStudentId).firstOrNull()
    }

    suspend fun getAcademicHealthSummary(): AcademicHealthSummary {
        val student = getActiveStudent() ?: StudentEntity(
            activeStudentId, "Student", "ENR-0000", "Section A", "B.Tech", false, 20
        )
        val risk = riskScoreDao.getLatestRiskScore(activeStudentId).firstOrNull()
        val pred = predictionDao.getLatestPrediction(activeStudentId, "overall").firstOrNull()
        val allMastery = masteryDao.getMasteryForStudent(activeStudentId).firstOrNull() ?: emptyList()
        val allAttendance = attendanceDao.getAttendanceForStudent(activeStudentId).firstOrNull() ?: emptyList()

        val masteredCount = allMastery.count { it.classification == "STRONG" }
        val weakCount = allMastery.count { it.classification == "WEAK" }
        val totalTopics = if (allMastery.isNotEmpty()) allMastery.size else 10

        val avgAttendance = if (allAttendance.isNotEmpty()) {
            allAttendance.map { it.percentage }.average()
        } else 80.0

        val riskScoreVal = risk?.score ?: 73.5
        val riskTier = when (risk?.tier) {
            "LOW" -> RiskTier.LOW
            "MEDIUM" -> RiskTier.MEDIUM
            else -> RiskTier.HIGH
        }

        val conf = when (pred?.confidence) {
            "HIGH" -> ConfidenceLevel.HIGH
            "MEDIUM" -> ConfidenceLevel.MEDIUM
            "COLD_START" -> ConfidenceLevel.COLD_START
            else -> if (student.isColdStart) ConfidenceLevel.COLD_START else ConfidenceLevel.HIGH
        }

        // Composite Health score (100 - risk_score)
        val healthScore = (100 - riskScoreVal).coerceIn(0.0, 100.0).toInt()

        return AcademicHealthSummary(
            compositeHealthScore = healthScore,
            predictedSemesterAverage = pred?.let { (it.predictedRangeLow + it.predictedRangeHigh) / 2 } ?: 66.0,
            predictedRangeLow = pred?.predictedRangeLow ?: 62.0,
            predictedRangeHigh = pred?.predictedRangeHigh ?: 70.0,
            confidence = conf,
            overallRiskScore = riskScoreVal,
            overallRiskTier = riskTier,
            topicsMasteredCount = masteredCount,
            topicsWeakCount = weakCount,
            totalTopicsCount = totalTopics,
            primaryDriverExplanation = pred?.explanation ?: "Low mastery in Probability (44%) and attendance (78%) are pulling your trajectory down.",
            attendanceAverage = avgAttendance,
            weeklyStudyHours = 12.5,
            isColdStart = student.isColdStart
        )
    }

    fun getSubjects(): Flow<List<SubjectEntity>> = subjectDao.getAllSubjects()

    fun getTopicsForSubject(subjectId: String): Flow<List<TopicEntity>> = topicDao.getTopicsForSubject(subjectId)

    fun getMasteryForStudent(): Flow<List<TopicMasteryEntity>> = masteryDao.getMasteryForStudent(activeStudentId)

    suspend fun getTopicMastery(topicId: String): TopicMasteryEntity? {
        return masteryDao.getMasteryForTopic(activeStudentId, topicId).firstOrNull()
    }

    fun getActiveLearningPlan(): Flow<LearningPlanEntity?> = planDao.getActivePlan(activeStudentId)

    fun getPlanItems(planId: Long): Flow<List<LearningPlanItemEntity>> = planDao.getPlanItems(planId)

    suspend fun updatePlanItemStatus(itemId: Long, status: String) {
        planDao.updateItemStatus(itemId, status)
    }

    suspend fun flagPrediction(predictionId: Long, reason: String) {
        predictionDao.flagPrediction(predictionId, reason)
    }

    fun getNotifications(): Flow<List<NotificationEntity>> = notificationDao.getNotificationsForStudent(activeStudentId)

    suspend fun markNotificationRead(id: Long) {
        notificationDao.markAsRead(id)
    }

    fun getInterventions(): Flow<List<InterventionLogEntity>> = interventionDao.getAllInterventions()

    suspend fun logIntervention(studentId: String, category: String, note: String, facultyName: String) {
        interventionDao.insertIntervention(
            InterventionLogEntity(
                studentId = studentId,
                facultyId = "fac_current",
                facultyName = facultyName,
                category = category,
                note = note,
                loggedAt = System.currentTimeMillis()
            )
        )
    }

    suspend fun addAcademicRecord(
        studentId: String,
        subjectId: String,
        type: String,
        title: String,
        value: Double,
        maxValue: Double
    ) {
        recordDao.insertRecord(
            AcademicRecordEntity(
                studentId = studentId,
                subjectId = subjectId,
                recordType = type,
                title = title,
                value = value,
                maxValue = maxValue,
                recordedAt = System.currentTimeMillis()
            )
        )
        recomputeCascade(studentId)
    }

    suspend fun updateAttendance(studentId: String, subjectId: String, percentage: Double) {
        attendanceDao.insertAttendance(
            AttendanceEntity(
                studentId = studentId,
                subjectId = subjectId,
                percentage = percentage,
                totalClasses = 40,
                attendedClasses = (40 * (percentage / 100.0)).toInt()
            )
        )
        recomputeCascade(studentId)
    }

    suspend fun regenerateLearningPlan() {
        val student = getActiveStudent() ?: return
        planDao.supersedeOlderPlans(activeStudentId)

        val newPlanId = planDao.insertPlan(
            LearningPlanEntity(
                studentId = activeStudentId,
                weekLabel = "Week ${System.currentTimeMillis() % 10 + 1}: AI Dynamic Adjusted Plan",
                isStretchPlan = student.isColdStart.not() && getAcademicHealthSummary().topicsWeakCount == 0,
                status = "active"
            )
        )

        val freshItems = listOf(
            LearningPlanItemEntity(0, newPlanId, "Mon", "RESOURCE", "math_prob", "math_201", "Essential Bayes' Theorem & Conditional Prob", 25, 1, "PENDING"),
            LearningPlanItemEntity(0, newPlanId, "Tue", "PRACTICE", "math_prob", "math_201", "Adaptive Practice: Total Probability Law", 30, 2, "PENDING"),
            LearningPlanItemEntity(0, newPlanId, "Wed", "RESOURCE", "math_calc", "math_201", "Calculus: Integration by Substitution", 25, 3, "PENDING"),
            LearningPlanItemEntity(0, newPlanId, "Thu", "QUIZ", "math_prob", "math_201", "Quick Diagnostic Checkpoint", 20, 4, "PENDING"),
            LearningPlanItemEntity(0, newPlanId, "Fri", "REVISION", "cs_trees", "cs_202", "Spaced Review: AVL Balance Factor", 20, 5, "PENDING")
        )
        planDao.insertPlanItems(freshItems)
    }

    suspend fun updateMasteryAfterQuiz(topicId: String, newAccuracy: Double) {
        val existing = masteryDao.getMasteryForTopic(activeStudentId, topicId).firstOrNull()
        val currentAttempts = (existing?.attemptsCount ?: 0) + 1
        val conceptUnderstanding = existing?.conceptUnderstanding ?: newAccuracy
        // Recency-weighted practice accuracy: 60% new + 40% old
        val practiceAcc = if (existing != null) {
            (newAccuracy * 0.6) + (existing.practiceAccuracy * 0.4)
        } else newAccuracy
        val revStability = 85.0

        // Mastery score formula (TRD §5): 0.4 * concept + 0.4 * practice + 0.2 * stability
        val newScore = (0.4 * conceptUnderstanding) + (0.4 * practiceAcc) + (0.2 * revStability)

        val classification = when {
            newScore >= 75.0 -> "STRONG"
            newScore >= 45.0 -> "MODERATE"
            else -> "WEAK"
        }

        masteryDao.insertOrUpdateMastery(
            TopicMasteryEntity(
                id = "$activeStudentId-$topicId",
                studentId = activeStudentId,
                topicId = topicId,
                subjectId = existing?.subjectId ?: "math_201",
                masteryScore = newScore,
                conceptUnderstanding = conceptUnderstanding,
                practiceAccuracy = practiceAcc,
                revisionStability = revStability,
                classification = classification,
                attemptsCount = currentAttempts,
                lastUpdatedAt = System.currentTimeMillis()
            )
        )

        recomputeCascade(activeStudentId)
    }

    suspend fun recomputeCascade(studentId: String) {
        val allMastery = masteryDao.getMasteryForStudent(studentId).firstOrNull() ?: emptyList()
        val allAttendance = attendanceDao.getAttendanceForStudent(studentId).firstOrNull() ?: emptyList()
        val allRecords = recordDao.getRecordsForStudent(studentId).firstOrNull() ?: emptyList()

        val avgAttendance = if (allAttendance.isNotEmpty()) allAttendance.map { it.percentage }.average() else 78.0
        val weakCount = allMastery.count { it.classification == "WEAK" }
        val strongCount = allMastery.count { it.classification == "STRONG" }
        val totalCount = allMastery.size.coerceAtLeast(1)

        val weakRatio = weakCount.toDouble() / totalCount.toDouble()

        // Risk composite from TRD §4.3
        val riskScore = (
            0.35 * (100.0 - 66.0) +
            0.30 * (100.0 - avgAttendance) +
            0.25 * (weakRatio * 100.0) +
            0.10 * 20.0
        ).coerceIn(10.0, 95.0)

        val riskTier = when {
            riskScore > 70.0 -> "HIGH"
            riskScore >= 40.0 -> "MEDIUM"
            else -> "LOW"
        }

        val predLow = (78.0 - (riskScore * 0.25)).coerceIn(40.0, 90.0)
        val predHigh = (predLow + 8.0).coerceIn(45.0, 98.0)

        val updatedDrivers = JSONArray().apply {
            put(JSONObject().apply {
                put("factorName", "Topic Mastery Distribution ($weakCount Weak / $strongCount Strong)")
                put("direction", if (weakCount > 1) "down" else "up")
                put("magnitudePct", (weakRatio * 30).toInt().coerceAtLeast(8))
                put("description", "$weakCount topics requiring remediation prior to exam window.")
            })
            put(JSONObject().apply {
                put("factorName", "Attendance at ${String.format("%.1f", avgAttendance)}%")
                put("direction", if (avgAttendance < 80.0) "down" else "up")
                put("magnitudePct", if (avgAttendance < 80.0) 12 else 10)
                put("description", "Eligibility margin tracking.")
            })
        }.toString()

        riskScoreDao.insertRiskScore(
            RiskScoreEntity(
                studentId = studentId,
                score = riskScore,
                tier = riskTier,
                driverFactorsJson = updatedDrivers,
                explanation = "Recomputed trajectory: $weakCount weak topics and ${String.format("%.1f", avgAttendance)}% attendance place your academic risk at $riskTier (${String.format("%.1f", riskScore)})."
            )
        )

        predictionDao.insertPrediction(
            PredictionEntity(
                studentId = studentId,
                subjectId = "overall",
                predictedRangeLow = predLow,
                predictedRangeHigh = predHigh,
                confidence = "HIGH",
                driverFactorsJson = updatedDrivers,
                explanation = "Predicted semester score range: ${String.format("%.0f", predLow)}% - ${String.format("%.0f", predHigh)}%. Targeted practice directly improves this range."
            )
        )
    }

    // Adaptive Question Bank for quizzes
    fun getAdaptiveQuestionsForTopic(topicId: String): List<QuizQuestion> {
        return when (topicId) {
            "math_prob" -> listOf(
                QuizQuestion(
                    id = "q_prob_1",
                    subjectId = "math_201",
                    topicId = "math_prob",
                    topicName = "Probability & Statistics",
                    difficulty = QuestionDifficulty.EASY,
                    text = "If two events A and B are mutually exclusive, what is P(A ∩ B)?",
                    options = listOf("0", "P(A) * P(B)", "P(A) + P(B)", "1"),
                    correctAnswerIndex = 0,
                    explanation = "Mutually exclusive events cannot happen at the same time, so the probability of their intersection is exactly 0.",
                    conceptReview = "Mutually exclusive means disjoint sets with empty intersection (A ∩ B = ∅)."
                ),
                QuizQuestion(
                    id = "q_prob_2",
                    subjectId = "math_201",
                    topicId = "math_prob",
                    topicName = "Probability & Statistics",
                    difficulty = QuestionDifficulty.MEDIUM,
                    text = "Given P(A) = 0.4, P(B) = 0.5, and P(A ∩ B) = 0.2, what is P(A | B)?",
                    options = listOf("0.20", "0.40", "0.50", "0.80"),
                    correctAnswerIndex = 1,
                    explanation = "P(A | B) = P(A ∩ B) / P(B) = 0.2 / 0.5 = 0.40.",
                    conceptReview = "Conditional probability formula restricts sample space: P(A|B) = P(A ∩ B) / P(B)."
                ),
                QuizQuestion(
                    id = "q_prob_3",
                    subjectId = "math_201",
                    topicId = "math_prob",
                    topicName = "Probability & Statistics",
                    difficulty = QuestionDifficulty.HARD,
                    text = "A diagnostic test for disease X has 95% sensitivity and 90% specificity. If disease prevalence is 1%, what is P(Disease | Positive)?",
                    options = listOf("~8.7%", "~95%", "~50%", "~1%"),
                    correctAnswerIndex = 0,
                    explanation = "By Bayes' Rule: P(D|+) = (0.95 * 0.01) / ((0.95 * 0.01) + (0.10 * 0.99)) = 0.0095 / 0.1085 ≈ 8.76%.",
                    conceptReview = "Bayes' Theorem incorporates base rate (prior). Rare diseases yield low positive predictive value even with high sensitivity!"
                ),
                QuizQuestion(
                    id = "q_prob_4",
                    subjectId = "math_201",
                    topicId = "math_prob",
                    topicName = "Probability & Statistics",
                    difficulty = QuestionDifficulty.EASY,
                    text = "What is the sum of probabilities of all elementary outcomes in a sample space?",
                    options = listOf("0", "0.5", "1.0", "Depends on sample size"),
                    correctAnswerIndex = 2,
                    explanation = "By Kolmogorov's 2nd axiom, P(S) = 1.",
                    conceptReview = "Total probability of the complete sample space is always 1.0."
                ),
                QuizQuestion(
                    id = "q_prob_5",
                    subjectId = "math_201",
                    topicId = "math_prob",
                    topicName = "Probability & Statistics",
                    difficulty = QuestionDifficulty.MEDIUM,
                    text = "For a standard normal distribution Z ~ N(0, 1), what is the mean and standard deviation?",
                    options = listOf("Mean = 0, Std = 1", "Mean = 1, Std = 0", "Mean = 0, Std = 0.5", "Mean = 1, Std = 1"),
                    correctAnswerIndex = 0,
                    explanation = "A standard normal distribution has μ = 0 and σ = 1.",
                    conceptReview = "Standard normal distribution transforms any normal X into Z = (X - μ) / σ."
                )
            )
            "math_calc" -> listOf(
                QuizQuestion(
                    id = "q_calc_1",
                    subjectId = "math_201",
                    topicId = "math_calc",
                    topicName = "Calculus & Integration",
                    difficulty = QuestionDifficulty.EASY,
                    text = "What is the integral ∫ x² dx?",
                    options = listOf("(x³)/3 + C", "2x + C", "x³ + C", "(x²)/2 + C"),
                    correctAnswerIndex = 0,
                    explanation = "By power rule: ∫ x^n dx = (x^(n+1))/(n+1) + C.",
                    conceptReview = "Power rule for integration increases exponent by 1 and divides by new power."
                ),
                QuizQuestion(
                    id = "q_calc_2",
                    subjectId = "math_201",
                    topicId = "math_calc",
                    topicName = "Calculus & Integration",
                    difficulty = QuestionDifficulty.MEDIUM,
                    text = "What is ∫ x * e^x dx using integration by parts?",
                    options = listOf("x * e^x - e^x + C", "x * e^x + e^x + C", "e^x + C", "(x²/2) * e^x + C"),
                    correctAnswerIndex = 0,
                    explanation = "Let u = x, dv = e^x dx. Then du = dx, v = e^x. ∫ u dv = uv - ∫ v du = x*e^x - e^x + C.",
                    conceptReview = "Integration by parts formula: ∫ u dv = uv - ∫ v du. Choose u using LIATE rule."
                ),
                QuizQuestion(
                    id = "q_calc_3",
                    subjectId = "math_201",
                    topicId = "math_calc",
                    topicName = "Calculus & Integration",
                    difficulty = QuestionDifficulty.HARD,
                    text = "Evaluate the definite integral ∫ from 0 to π of sin²(x) dx:",
                    options = listOf("π / 2", "π", "0", "1"),
                    correctAnswerIndex = 0,
                    explanation = "Use identity sin²(x) = (1 - cos(2x))/2. Integral becomes [x/2 - sin(2x)/4] from 0 to π = π/2.",
                    conceptReview = "Trig power reduction: sin²(θ) = (1 - cos(2θ))/2."
                )
            )
            else -> listOf(
                QuizQuestion(
                    id = "q_gen_1",
                    subjectId = "math_201",
                    topicId = topicId,
                    topicName = "Topic Concept Check",
                    difficulty = QuestionDifficulty.EASY,
                    text = "What is the primary condition for an n×n matrix A to be invertible?",
                    options = listOf("det(A) ≠ 0", "det(A) = 0", "A has all positive entries", "A is triangular"),
                    correctAnswerIndex = 0,
                    explanation = "A matrix is invertible (non-singular) if and only if its determinant is non-zero.",
                    conceptReview = "Invertibility theorem: det(A) ≠ 0 implies full rank and trivial null space."
                ),
                QuizQuestion(
                    id = "q_gen_2",
                    subjectId = "math_201",
                    topicId = topicId,
                    topicName = "Topic Concept Check",
                    difficulty = QuestionDifficulty.MEDIUM,
                    text = "What are the eigenvalues of an identity matrix I_n?",
                    options = listOf("All 1", "All 0", "1 to n", "Undefined"),
                    correctAnswerIndex = 0,
                    explanation = "Since I * v = 1 * v for any non-zero vector v, all eigenvalues are equal to 1 with multiplicity n.",
                    conceptReview = "Eigenvalue equation: A*v = λ*v."
                )
            )
        }
    }
}
