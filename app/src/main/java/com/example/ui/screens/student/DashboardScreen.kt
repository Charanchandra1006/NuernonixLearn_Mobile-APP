package com.example.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.*
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.LearnSenseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: LearnSenseViewModel,
    onNavigateToSubjects: () -> Unit,
    onNavigateToTopics: () -> Unit,
    onNavigateToPlan: () -> Unit,
    onNavigateToQuiz: (String) -> Unit,
    onNavigateToRiskDetail: () -> Unit,
    onNavigateToAiAssistant: () -> Unit,
    modifier: Modifier = Modifier
) {
    val activeStudent by viewModel.activeStudent.collectAsState()
    val healthSummary by viewModel.healthSummary.collectAsState()
    val planItems by viewModel.planItems.collectAsState()
    val subjects by viewModel.subjects.collectAsState()
    val notifications by viewModel.notifications.collectAsState()
    val unreadNotifsCount = notifications.count { !it.isRead }

    var showPersonaDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "LearnSense",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = Color.Black
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = Color(0xFFF3F4F6),
                                shape = RoundedCornerShape(6.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE5E7EB))
                            ) {
                                Text(
                                    text = "AI-Powered",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                                    color = Color.Black,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = activeStudent?.let { "${it.name} • ${it.cohort}" } ?: "Student Profile",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF4B5563)
                        )
                    }
                },
                actions = {
                    // Persona Switcher
                    IconButton(
                        onClick = { showPersonaDialog = true },
                        modifier = Modifier.testTag("switch_persona_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.SwitchAccount,
                            contentDescription = "Switch Student Persona",
                            tint = Color.Black
                        )
                    }
                    // Notifications
                    BadgedBox(
                        badge = {
                            if (unreadNotifsCount > 0) {
                                Badge { Text("$unreadNotifsCount") }
                            }
                        },
                        modifier = Modifier.padding(end = 8.dp)
                    ) {
                        IconButton(onClick = onNavigateToRiskDetail) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = "Alerts",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        modifier = modifier
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 12.dp)
        ) {
            // 1. Academic Health Composite Card (SRS-F-020, SRS-F-030)
            item {
                val summary = healthSummary
                if (summary != null) {
                    if (summary.isColdStart) {
                        // Cold-start prompt state (PRD-TRUST-06 & SRS-F-080)
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("cold_start_card"),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Column(modifier = Modifier.padding(20.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Psychology,
                                        contentDescription = null,
                                        tint = BrandPrimary,
                                        modifier = Modifier.size(28.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = "Building Your Academic Profile",
                                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "We need a bit more diagnostic data before showing full prediction ranges. Take the short 5-minute diagnostic quiz to unlock personalized recommendations.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(modifier = Modifier.height(14.dp))
                                Button(
                                    onClick = { onNavigateToQuiz("math_prob") },
                                    modifier = Modifier.fillMaxWidth().testTag("start_diagnostic_quiz_button"),
                                    colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                                ) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Start Initial Diagnostic Quiz")
                                }
                            }
                        }
                    } else {
                        // Populated Academic Health Summary Card
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onNavigateToRiskDetail() }
                                .testTag("academic_health_card"),
                            shape = RoundedCornerShape(22.dp),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = Color.White
                            ),
                            border = CardDefaults.outlinedCardBorder()
                        ) {
                            Column(modifier = Modifier.padding(18.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "Academic Trajectory",
                                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = "Semester Score: ${String.format("%.0f", summary.predictedRangeLow)}% – ${String.format("%.0f", summary.predictedRangeHigh)}%",
                                            style = MaterialTheme.typography.titleLarge.copy(
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 20.sp
                                            ),
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                    RiskBadge(tier = summary.overallRiskTier)
                                }

                                Spacer(modifier = Modifier.height(12.dp))

                                // Health index & confidence
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    ConfidenceBadge(confidence = summary.confidence)
                                    Text(
                                        text = "Risk Index: ${String.format("%.1f", summary.overallRiskScore)}/100",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }

                                Spacer(modifier = Modifier.height(10.dp))
                                HorizontalDivider(color = Color(0xFFD1D5DB), thickness = 1.dp)
                                Spacer(modifier = Modifier.height(10.dp))

                                // Driver explanation
                                Row(verticalAlignment = Alignment.Top) {
                                    Icon(
                                        imageVector = Icons.Default.Info,
                                        contentDescription = null,
                                        tint = when (summary.overallRiskTier) {
                                            RiskTier.HIGH -> RiskHigh
                                            RiskTier.MEDIUM -> RiskMedium
                                            RiskTier.LOW -> RiskLow
                                        },
                                        modifier = Modifier.size(16.dp).padding(top = 2.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = summary.primaryDriverExplanation,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // 2. Metrics Grid: Mastered vs Weak topics, Attendance, Next Exam
            item {
                val summary = healthSummary
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "Mastered",
                        value = "${summary?.topicsMasteredCount ?: 0}",
                        subtitle = "Strong concepts",
                        icon = Icons.Default.CheckCircle,
                        accentColor = RiskLow,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onNavigateToTopics() }
                    )
                    MetricCard(
                        title = "Weak Topics",
                        value = "${summary?.topicsWeakCount ?: 0}",
                        subtitle = "Needs attention",
                        icon = Icons.Default.ErrorOutline,
                        accentColor = RiskHigh,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onNavigateToTopics() }
                    )
                    MetricCard(
                        title = "Attendance",
                        value = "${String.format("%.0f", summary?.attendanceAverage ?: 78.0)}%",
                        subtitle = "Min 75% req",
                        icon = Icons.Default.CalendarToday,
                        accentColor = if ((summary?.attendanceAverage ?: 78.0) < 80.0) RiskMedium else BrandPrimary,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onNavigateToSubjects() }
                    )
                }
            }

            // 3. Quick AI Actions Bar
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(BrandPrimaryContainer),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AutoAwesome,
                                    contentDescription = null,
                                    tint = BrandPrimary,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "AI Study Assistant",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                                )
                                Text(
                                    text = "Grounded in your weak topics & syllabus",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        FilledTonalButton(
                            onClick = onNavigateToAiAssistant,
                            modifier = Modifier.testTag("open_ai_assistant_button")
                        ) {
                            Text("Chat")
                        }
                    }
                }
            }

            // 4. Today's Learning Plan (FSD A.2 / A.8)
            item {
                SectionHeader(
                    title = "Today's Learning Plan",
                    subtitle = "Prioritized by risk impact & exam proximity",
                    actionText = "View All",
                    onAction = onNavigateToPlan
                )
            }

            val todayItems = planItems.take(3)
            if (todayItems.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("🎉 All done for today! Take an adaptive quiz or rest.", style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            } else {
                items(todayItems) { item ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (item.status == "COMPLETED") MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f) else MaterialTheme.colorScheme.surface
                        ),
                        border = CardDefaults.outlinedCardBorder()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = item.status == "COMPLETED",
                                onCheckedChange = { viewModel.togglePlanItem(item.id, item.status) },
                                modifier = Modifier.testTag("plan_item_checkbox_${item.id}")
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = item.title,
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        fontWeight = FontWeight.SemiBold
                                    ),
                                    color = if (item.status == "COMPLETED") MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Surface(
                                        color = BrandSecondaryContainer,
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            text = item.type,
                                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                            color = BrandOnSecondaryContainer,
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "${item.estimatedMinutes} mins",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                            if (item.type == "QUIZ") {
                                IconButton(onClick = { onNavigateToQuiz(item.topicId) }) {
                                    Icon(
                                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                        contentDescription = "Start Quiz",
                                        tint = BrandPrimary
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // 5. Enrolled Subjects Summary
            item {
                SectionHeader(
                    title = "Enrolled Subjects",
                    subtitle = "Predicted grade bands & risk tiers",
                    actionText = "Analytics",
                    onAction = onNavigateToSubjects
                )
            }

            items(subjects) { subject ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToSubjects() },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = subject.name,
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "${subject.code} • ${subject.credits} Credits",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Predicted: ${String.format("%.0f", subject.predictedRangeLow)}% - ${String.format("%.0f", subject.predictedRangeHigh)}%",
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Medium),
                                color = BrandPrimary
                            )
                        }
                        val tier = when (subject.riskTier) {
                            "HIGH" -> RiskTier.HIGH
                            "MEDIUM" -> RiskTier.MEDIUM
                            else -> RiskTier.LOW
                        }
                        RiskBadge(tier = tier)
                    }
                }
            }
        }
    }

    // Persona Switcher Dialog (PRD §4 & §32)
    if (showPersonaDialog) {
        AlertDialog(
            onDismissRequest = { showPersonaDialog = false },
            title = { Text("Select Student Profile") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Switch between sample test personas to verify adaptive behavior:", style = MaterialTheme.typography.bodySmall)

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                viewModel.switchStudent("rahul_001")
                                showPersonaDialog = false
                            },
                        colors = CardDefaults.cardColors(containerColor = BrandPrimaryContainer)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Rahul Sharma (PRD §32 Persona)", fontWeight = FontWeight.Bold, color = BrandOnPrimaryContainer)
                            Text("At-Risk • Weak Probability (44%) • 78% Attendance", style = MaterialTheme.typography.bodySmall)
                        }
                    }

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                viewModel.switchStudent("priya_002")
                                showPersonaDialog = false
                            }
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Priya Patel (High Achiever)", fontWeight = FontWeight.Bold)
                            Text("Low Risk • Stretch Plan • 95% Attendance", style = MaterialTheme.typography.bodySmall)
                        }
                    }

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                viewModel.switchStudent("alex_003")
                                showPersonaDialog = false
                            }
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Alex Chen (Cold-Start Student)", fontWeight = FontWeight.Bold)
                            Text("Preliminary • Needs Diagnostic Onboarding", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showPersonaDialog = false }) {
                    Text("Close")
                }
            }
        )
    }
}
