package com.example.ui.screens.student

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.QuestionDifficulty
import com.example.ui.theme.*
import com.example.ui.viewmodel.LearnSenseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdaptiveQuizScreen(
    viewModel: LearnSenseViewModel,
    topicId: String,
    onBack: () -> Unit,
    onNavigateToAiAssistant: () -> Unit,
    modifier: Modifier = Modifier
) {
    val quizState by viewModel.quizState.collectAsState()

    LaunchedEffect(topicId) {
        viewModel.startQuiz(topicId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Adaptive Assessment",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = quizState.topicName,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        modifier = modifier
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when {
                // 1. Circuit Breaker Interstitial State (SRS-F-071)
                quizState.isCircuitBreakerActive -> {
                    CircuitBreakerInterstitial(
                        conceptReview = quizState.circuitBreakerConceptReview,
                        topicName = quizState.topicName,
                        onContinue = { viewModel.dismissCircuitBreaker() }
                    )
                }

                // 2. Finished Results State (SRS-F-080 / FSD A.11)
                quizState.isQuizFinished -> {
                    QuizResultsView(
                        correctCount = quizState.correctCount,
                        totalCount = quizState.questions.size,
                        initialMastery = quizState.initialMasteryScore,
                        updatedMastery = quizState.updatedMasteryScore,
                        topicName = quizState.topicName,
                        onAskAi = onNavigateToAiAssistant,
                        onDone = onBack
                    )
                }

                // 3. Question Screen (FSD A.10)
                else -> {
                    val currentQuestion = quizState.questions.getOrNull(quizState.currentIndex)
                    if (currentQuestion != null) {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 16.dp),
                            verticalArrangement = Arrangement.spacedBy(16.dp),
                            contentPadding = PaddingValues(vertical = 12.dp)
                        ) {
                            // Question header + Adaptive difficulty pill
                            item {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Question ${quizState.currentIndex + 1} of ${quizState.questions.size}",
                                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    // Adaptive difficulty indicator (SRS-F-070)
                                    Surface(
                                        color = when (quizState.currentDifficulty) {
                                            QuestionDifficulty.EASY -> Color(0xFFD1FAE5)
                                            QuestionDifficulty.MEDIUM -> Color(0xFFFEF3C7)
                                            QuestionDifficulty.HARD -> Color(0xFFFEE2E2)
                                        },
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text(
                                            text = "Adaptive Level: ${quizState.currentDifficulty.name}",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                            color = when (quizState.currentDifficulty) {
                                                QuestionDifficulty.EASY -> RiskLow
                                                QuestionDifficulty.MEDIUM -> RiskMedium
                                                QuestionDifficulty.HARD -> RiskHigh
                                            },
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                            }

                            // Linear progress indicator
                            item {
                                val progress = ((quizState.currentIndex + 1).toFloat() / quizState.questions.size.toFloat())
                                LinearProgressIndicator(
                                    progress = { progress },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(8.dp)
                                        .clip(RoundedCornerShape(4.dp)),
                                    color = Color.Black,
                                    trackColor = Color(0xFFE5E7EB)
                                )
                            }

                            // Question prompt card
                            item {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(18.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    border = CardDefaults.outlinedCardBorder()
                                ) {
                                    Column(modifier = Modifier.padding(18.dp)) {
                                        Text(
                                            text = currentQuestion.text,
                                            style = MaterialTheme.typography.titleMedium.copy(
                                                fontWeight = FontWeight.SemiBold,
                                                lineHeight = 24.sp
                                            ),
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                }
                            }

                            // Multiple choice options
                            items(currentQuestion.options.size) { index ->
                                val optionText = currentQuestion.options[index]
                                val isSelected = quizState.selectedOptionIndex == index
                                val isCorrectOption = index == currentQuestion.correctAnswerIndex

                                val optionBorderColor = when {
                                    !quizState.isAnswerSubmitted && isSelected -> Color.Black
                                    quizState.isAnswerSubmitted && isCorrectOption -> RiskLow
                                    quizState.isAnswerSubmitted && isSelected && !isCorrectOption -> RiskHigh
                                    else -> Color(0xFFD1D5DB)
                                }

                                val optionBgColor = when {
                                    !quizState.isAnswerSubmitted && isSelected -> Color(0xFFF3F4F6)
                                    quizState.isAnswerSubmitted && isCorrectOption -> RiskLowContainer
                                    quizState.isAnswerSubmitted && isSelected && !isCorrectOption -> RiskHighContainer
                                    else -> MaterialTheme.colorScheme.surface
                                }

                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("option_$index")
                                        .clickable(enabled = !quizState.isAnswerSubmitted) {
                                            viewModel.selectQuizOption(index)
                                        },
                                    shape = RoundedCornerShape(14.dp),
                                    colors = CardDefaults.cardColors(containerColor = optionBgColor),
                                    border = androidx.compose.foundation.BorderStroke(
                                        if (isSelected || quizState.isAnswerSubmitted) 2.dp else 1.dp,
                                        optionBorderColor
                                    )
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(16.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(28.dp)
                                                .clip(CircleShape)
                                                .background(
                                                    if (isSelected || (quizState.isAnswerSubmitted && isCorrectOption)) optionBorderColor else Color(0xFFF3F4F6)
                                                )
                                                .border(1.dp, optionBorderColor, CircleShape),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = ('A'.code + index).toChar().toString(),
                                                style = MaterialTheme.typography.labelMedium.copy(
                                                    fontWeight = FontWeight.Bold,
                                                    color = if (isSelected || (quizState.isAnswerSubmitted && isCorrectOption)) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                                )
                                            )
                                        }
                                        Spacer(modifier = Modifier.width(14.dp))
                                        Text(
                                            text = optionText,
                                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                                            color = MaterialTheme.colorScheme.onSurface,
                                            modifier = Modifier.weight(1f)
                                        )
                                        if (quizState.isAnswerSubmitted) {
                                            if (isCorrectOption) {
                                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = RiskLow)
                                            } else if (isSelected) {
                                                Icon(Icons.Default.Cancel, contentDescription = null, tint = RiskHigh)
                                            }
                                        }
                                    }
                                }
                            }

                            // Immediate Feedback & Explanation Card
                            if (quizState.isAnswerSubmitted) {
                                item {
                                    Card(
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = CardDefaults.cardColors(
                                            containerColor = if (quizState.isCorrectAnswer) RiskLowContainer else Color(0xFFFEF2F2)
                                        ),
                                        shape = RoundedCornerShape(14.dp)
                                    ) {
                                        Column(modifier = Modifier.padding(16.dp)) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Icon(
                                                    imageVector = if (quizState.isCorrectAnswer) Icons.Default.CheckCircle else Icons.Default.Error,
                                                    contentDescription = null,
                                                    tint = if (quizState.isCorrectAnswer) RiskLow else RiskHigh
                                                )
                                                Spacer(modifier = Modifier.width(8.dp))
                                                Text(
                                                    text = if (quizState.isCorrectAnswer) "Correct Answer!" else "Incorrect",
                                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                                    color = if (quizState.isCorrectAnswer) RiskLow else RiskHigh
                                                )
                                            }
                                            Spacer(modifier = Modifier.height(6.dp))
                                            Text(
                                                text = currentQuestion.explanation,
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.onSurface
                                            )
                                        }
                                    }
                                }
                            }

                            // Next / Submit Button
                            item {
                                Spacer(modifier = Modifier.height(10.dp))
                                if (!quizState.isAnswerSubmitted) {
                                    Button(
                                        onClick = { viewModel.submitQuizAnswer() },
                                        enabled = quizState.selectedOptionIndex != null,
                                        modifier = Modifier.fillMaxWidth().testTag("submit_answer_button"),
                                        colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                                    ) {
                                        Text("Submit Answer")
                                    }
                                } else {
                                    Button(
                                        onClick = { viewModel.advanceQuiz() },
                                        modifier = Modifier.fillMaxWidth().testTag("next_question_button"),
                                        colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                                    ) {
                                        Text(if (quizState.currentIndex + 1 >= quizState.questions.size) "Finish Quiz" else "Next Question")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// Circuit-Breaker Interstitial State (SRS-F-071 & FSD A.10 step 4)
@Composable
fun CircuitBreakerInterstitial(
    conceptReview: String,
    topicName: String,
    onContinue: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Card(
            modifier = Modifier.fillMaxWidth().testTag("circuit_breaker_card"),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = CardDefaults.outlinedCardBorder()
        ) {
            Column(modifier = Modifier.padding(22.dp)) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(RiskMedium.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Lightbulb,
                        contentDescription = null,
                        tint = RiskMedium,
                        modifier = Modifier.size(28.dp)
                    )
                }
                Spacer(modifier = Modifier.height(14.dp))
                Text(
                    text = "Let's Review This Concept First",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "We noticed 3 consecutive misses on $topicName. In accordance with pedagogical circuit-breaking, let's refresh the core rule before trying another problem at an accessible level.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(16.dp))
                Surface(
                    color = Color.White,
                    shape = RoundedCornerShape(12.dp),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "Key Concept Summary:",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = BrandPrimary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = conceptReview,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
                Spacer(modifier = Modifier.height(20.dp))
                Button(
                    onClick = onContinue,
                    modifier = Modifier.fillMaxWidth().testTag("resume_quiz_button"),
                    colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                ) {
                    Text("I Understand — Continue Quiz")
                }
            }
        }
    }
}

// Quiz Results Screen (FSD A.11 & SRS-F-080 before/after comparison)
@Composable
fun QuizResultsView(
    correctCount: Int,
    totalCount: Int,
    initialMastery: Double,
    updatedMastery: Double,
    topicName: String,
    onAskAi: () -> Unit,
    onDone: () -> Unit
) {
    val delta = updatedMastery - initialMastery
    val isGain = delta >= 0

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Card(
            modifier = Modifier.fillMaxWidth().testTag("quiz_results_card"),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            border = CardDefaults.outlinedCardBorder()
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .clip(CircleShape)
                        .background(RiskLowContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.EmojiEvents,
                        contentDescription = null,
                        tint = RiskLow,
                        modifier = Modifier.size(36.dp)
                    )
                }
                Spacer(modifier = Modifier.height(14.dp))
                Text(
                    text = "Quiz Completed!",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold)
                )
                Text(
                    text = "Score: $correctCount / $totalCount Correct",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Before -> After Mastery Delta (PRD §12 & SRS-F-080)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Topic Mastery Uplift (SRS-F-080)",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(topicName, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
                            Text(
                                text = "${String.format("%.0f", initialMastery)}% → ${String.format("%.0f", updatedMastery)}%",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = if (isGain) RiskLow else RiskHigh
                                )
                            )
                        }
                        if (isGain) {
                            Text(
                                text = "+${String.format("%.1f", delta)}% mastery gain from this session!",
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
                                color = RiskLow
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(22.dp))

                // Actions
                OutlinedButton(
                    onClick = onAskAi,
                    modifier = Modifier.fillMaxWidth().testTag("ask_ai_results_button")
                ) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = BrandPrimary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Ask AI Assistant About Missed Questions")
                }
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = onDone,
                    modifier = Modifier.fillMaxWidth().testTag("done_quiz_button"),
                    colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                ) {
                    Text("Return to Dashboard")
                }
            }
        }
    }
}
