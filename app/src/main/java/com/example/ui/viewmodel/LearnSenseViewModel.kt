package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.*
import com.example.data.model.*
import com.example.data.remote.GeminiService
import com.example.data.repository.LearnSenseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

data class AdaptiveQuizUiState(
    val topicId: String = "math_prob",
    val topicName: String = "Probability & Statistics",
    val questions: List<QuizQuestion> = emptyList(),
    val currentIndex: Int = 0,
    val currentDifficulty: QuestionDifficulty = QuestionDifficulty.MEDIUM,
    val consecutiveMissesOnTopic: Int = 0,
    val isCircuitBreakerActive: Boolean = false,
    val circuitBreakerConceptReview: String = "",
    val selectedOptionIndex: Int? = null,
    val isAnswerSubmitted: Boolean = false,
    val isCorrectAnswer: Boolean = false,
    val correctCount: Int = 0,
    val isQuizFinished: Boolean = false,
    val initialMasteryScore: Double = 44.0,
    val updatedMasteryScore: Double = 44.0
)

class LearnSenseViewModel(
    private val repository: LearnSenseRepository,
    private val geminiService: GeminiService = GeminiService()
) : ViewModel() {

    private val _currentRole = MutableStateFlow(UserRole.STUDENT)
    val currentRole: StateFlow<UserRole> = _currentRole.asStateFlow()

    private val _activeStudent = MutableStateFlow<StudentEntity?>(null)
    val activeStudent: StateFlow<StudentEntity?> = _activeStudent.asStateFlow()

    private val _healthSummary = MutableStateFlow<AcademicHealthSummary?>(null)
    val healthSummary: StateFlow<AcademicHealthSummary?> = _healthSummary.asStateFlow()

    private val _subjects = MutableStateFlow<List<SubjectEntity>>(emptyList())
    val subjects: StateFlow<List<SubjectEntity>> = _subjects.asStateFlow()

    private val _topicsMastery = MutableStateFlow<List<TopicMasteryEntity>>(emptyList())
    val topicsMastery: StateFlow<List<TopicMasteryEntity>> = _topicsMastery.asStateFlow()

    private val _activePlan = MutableStateFlow<LearningPlanEntity?>(null)
    val activePlan: StateFlow<LearningPlanEntity?> = _activePlan.asStateFlow()

    private val _planItems = MutableStateFlow<List<LearningPlanItemEntity>>(emptyList())
    val planItems: StateFlow<List<LearningPlanItemEntity>> = _planItems.asStateFlow()

    private val _driverFactors = MutableStateFlow<List<DriverFactor>>(emptyList())
    val driverFactors: StateFlow<List<DriverFactor>> = _driverFactors.asStateFlow()

    private val _notifications = MutableStateFlow<List<NotificationEntity>>(emptyList())
    val notifications: StateFlow<List<NotificationEntity>> = _notifications.asStateFlow()

    private val _interventions = MutableStateFlow<List<InterventionLogEntity>>(emptyList())
    val interventions: StateFlow<List<InterventionLogEntity>> = _interventions.asStateFlow()

    // Adaptive Quiz State
    private val _quizState = MutableStateFlow(AdaptiveQuizUiState())
    val quizState: StateFlow<AdaptiveQuizUiState> = _quizState.asStateFlow()

    // AI Study Assistant State
    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    private val _isAssistantTyping = MutableStateFlow(false)
    val isAssistantTyping: StateFlow<Boolean> = _isAssistantTyping.asStateFlow()

    init {
        viewModelScope.launch {
            repository.initializeDatabase()
            refreshAll()
            initializeDefaultChat()
        }
    }

    fun setRole(role: UserRole) {
        _currentRole.value = role
    }

    fun switchStudent(studentId: String) {
        viewModelScope.launch {
            repository.activeStudentId = studentId
            refreshAll()
        }
    }

    fun refreshAll() {
        viewModelScope.launch {
            val student = repository.getActiveStudent()
            _activeStudent.value = student

            val summary = repository.getAcademicHealthSummary()
            _healthSummary.value = summary

            repository.getSubjects().collect { list ->
                _subjects.value = list
            }
        }
        viewModelScope.launch {
            repository.getMasteryForStudent().collect { list ->
                _topicsMastery.value = list
            }
        }
        viewModelScope.launch {
            repository.getActiveLearningPlan().collect { plan ->
                _activePlan.value = plan
                if (plan != null) {
                    repository.getPlanItems(plan.id).collect { items ->
                        _planItems.value = items
                    }
                } else {
                    _planItems.value = emptyList()
                }
            }
        }
        viewModelScope.launch {
            repository.getNotifications().collect { notifs ->
                _notifications.value = notifs
            }
        }
        viewModelScope.launch {
            repository.getInterventions().collect { logs ->
                _interventions.value = logs
            }
        }
        loadDriverFactors()
    }

    private fun loadDriverFactors() {
        viewModelScope.launch {
            val factors = listOf(
                DriverFactor("Probability & Statistics Mastery", "down", 14, "Weak foundational conditional probability accuracy."),
                DriverFactor("Calculus & Integration Mastery", "down", 11, "Missed substitution & parts techniques on recent test."),
                DriverFactor("Attendance Margin (78%)", "down", 8, "Eligibility cutoff is 75% — risk of attendance short."),
                DriverFactor("Matrices & Linear Algebra Mastery", "up", 15, "Solid foundation in matrix operations and determinants.")
            )
            _driverFactors.value = factors
        }
    }

    fun togglePlanItem(itemId: Long, currentStatus: String) {
        viewModelScope.launch {
            val nextStatus = if (currentStatus == "COMPLETED") "PENDING" else "COMPLETED"
            repository.updatePlanItemStatus(itemId, nextStatus)
        }
    }

    fun regeneratePlan() {
        viewModelScope.launch {
            repository.regenerateLearningPlan()
            val summary = repository.getAcademicHealthSummary()
            _healthSummary.value = summary
        }
    }

    fun flagPrediction(reason: String) {
        viewModelScope.launch {
            repository.flagPrediction(1, reason)
        }
    }

    fun logIntervention(category: String, note: String, facultyName: String) {
        viewModelScope.launch {
            repository.logIntervention(repository.activeStudentId, category, note, facultyName)
        }
    }

    fun addManualAcademicRecord(subjectId: String, type: String, title: String, value: Double, maxValue: Double) {
        viewModelScope.launch {
            repository.addAcademicRecord(repository.activeStudentId, subjectId, type, title, value, maxValue)
            refreshAll()
        }
    }

    fun updateStudentAttendance(subjectId: String, percentage: Double) {
        viewModelScope.launch {
            repository.updateAttendance(repository.activeStudentId, subjectId, percentage)
            refreshAll()
        }
    }

    // --- Adaptive Quiz Logic (SRS-F-070, SRS-F-071, SRS-F-072) ---
    fun startQuiz(topicId: String = "math_prob") {
        val topicQuestions = repository.getAdaptiveQuestionsForTopic(topicId)
        val initialMastery = _topicsMastery.value.find { it.topicId == topicId }?.masteryScore ?: 44.0
        val topicName = when (topicId) {
            "math_prob" -> "Probability & Statistics"
            "math_calc" -> "Calculus & Integration"
            else -> "Engineering Mathematics"
        }
        _quizState.value = AdaptiveQuizUiState(
            topicId = topicId,
            topicName = topicName,
            questions = topicQuestions,
            currentIndex = 0,
            currentDifficulty = QuestionDifficulty.MEDIUM,
            consecutiveMissesOnTopic = 0,
            isCircuitBreakerActive = false,
            selectedOptionIndex = null,
            isAnswerSubmitted = false,
            isCorrectAnswer = false,
            correctCount = 0,
            isQuizFinished = false,
            initialMasteryScore = initialMastery,
            updatedMasteryScore = initialMastery
        )
    }

    fun selectQuizOption(index: Int) {
        if (_quizState.value.isAnswerSubmitted) return
        _quizState.value = _quizState.value.copy(selectedOptionIndex = index)
    }

    fun submitQuizAnswer() {
        val state = _quizState.value
        val selected = state.selectedOptionIndex ?: return
        val currentQuestion = state.questions.getOrNull(state.currentIndex) ?: return
        val isCorrect = selected == currentQuestion.correctAnswerIndex

        val newCorrectCount = if (isCorrect) state.correctCount + 1 else state.correctCount
        val consecutiveMisses = if (isCorrect) 0 else state.consecutiveMissesOnTopic + 1

        // Circuit breaker check (SRS-F-071): 3 consecutive misses triggers concept interstitial!
        val triggerCircuitBreaker = consecutiveMisses >= 3

        _quizState.value = state.copy(
            isAnswerSubmitted = true,
            isCorrectAnswer = isCorrect,
            correctCount = newCorrectCount,
            consecutiveMissesOnTopic = consecutiveMisses,
            isCircuitBreakerActive = triggerCircuitBreaker,
            circuitBreakerConceptReview = currentQuestion.conceptReview
        )
    }

    fun dismissCircuitBreaker() {
        // Step down difficulty after circuit breaker per SRS-F-071
        _quizState.value = _quizState.value.copy(
            isCircuitBreakerActive = false,
            consecutiveMissesOnTopic = 0,
            currentDifficulty = QuestionDifficulty.EASY
        )
        advanceQuiz()
    }

    fun advanceQuiz() {
        val state = _quizState.value
        val nextIndex = state.currentIndex + 1

        if (nextIndex >= state.questions.size) {
            // Finish quiz & calculate updated topic mastery
            val accuracy = if (state.questions.isNotEmpty()) {
                (state.correctCount.toDouble() / state.questions.size.toDouble()) * 100.0
            } else 50.0

            viewModelScope.launch {
                repository.updateMasteryAfterQuiz(state.topicId, accuracy)
                val updatedMastery = repository.getTopicMastery(state.topicId)?.masteryScore ?: (state.initialMasteryScore + 8.0)
                _quizState.value = _quizState.value.copy(
                    isQuizFinished = true,
                    updatedMasteryScore = updatedMastery
                )
                refreshAll()
            }
        } else {
            // Adaptive difficulty state machine (TRD §6)
            val nextDiff = when {
                state.isCorrectAnswer && state.currentDifficulty == QuestionDifficulty.EASY -> QuestionDifficulty.MEDIUM
                state.isCorrectAnswer && state.currentDifficulty == QuestionDifficulty.MEDIUM -> QuestionDifficulty.HARD
                !state.isCorrectAnswer && state.currentDifficulty == QuestionDifficulty.HARD -> QuestionDifficulty.MEDIUM
                !state.isCorrectAnswer && state.currentDifficulty == QuestionDifficulty.MEDIUM -> QuestionDifficulty.EASY
                else -> state.currentDifficulty
            }

            _quizState.value = state.copy(
                currentIndex = nextIndex,
                currentDifficulty = nextDiff,
                selectedOptionIndex = null,
                isAnswerSubmitted = false,
                isCorrectAnswer = false
            )
        }
    }

    // --- AI Study Assistant (SRS-F-090, SRS-F-091) ---
    private fun initializeDefaultChat() {
        _chatMessages.value = listOf(
            ChatMessage(
                sender = "learnsense_ai",
                text = "Hello Rahul! I'm your LearnSense AI Assistant. I see you're currently in High Risk primarily due to Probability & Statistics (44%) and Calculus. I can explain any concept, analyze mistakes, or generate custom step-by-step solutions for you."
            )
        )
    }

    fun sendChatMessage(query: String) {
        if (query.isBlank()) return
        val userMsg = ChatMessage(sender = "user", text = query.trim())
        _chatMessages.value = _chatMessages.value + userMsg

        _isAssistantTyping.value = true

        val summary = _healthSummary.value
        val contextInfo = "Student: ${activeStudent.value?.name ?: "Rahul"}, Risk: ${summary?.overallRiskTier?.label ?: "High Risk"} (${summary?.overallRiskScore ?: 73.5}), Weak topics: Probability (44%), Calculus (48%), Attendance: ${summary?.attendanceAverage ?: 78.0}%."

        viewModelScope.launch {
            val response = geminiService.generateTutorResponse(query, contextInfo)
            _isAssistantTyping.value = false
            _chatMessages.value = _chatMessages.value + ChatMessage(
                sender = "learnsense_ai",
                text = response
            )
        }
    }
}
