package com.example.ui.screens.faculty

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
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
import com.example.data.local.InterventionLogEntity
import com.example.data.model.RiskTier
import com.example.ui.components.RiskBadge
import com.example.ui.components.SectionHeader
import com.example.ui.theme.*
import com.example.ui.viewmodel.LearnSenseViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FacultyDashboardScreen(
    viewModel: LearnSenseViewModel,
    modifier: Modifier = Modifier
) {
    val interventions by viewModel.interventions.collectAsState()
    var selectedSection by remember { mutableStateOf("Section B (2nd Year)") }
    var showInterventionDialog by remember { mutableStateOf(false) }
    var selectedStudentForIntervention by remember { mutableStateOf("Rahul Sharma (ENR-2024-8842)") }
    var interventionCategory by remember { mutableStateOf("MET_WITH_STUDENT") }
    var interventionNote by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Faculty Cohort Monitor",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = BrandTertiaryContainer,
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = "Instructor Portal",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = BrandTertiary,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = "Engineering Mathematics • Dr. R. Iyer",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    Button(
                        onClick = { showInterventionDialog = true },
                        modifier = Modifier
                            .padding(end = 8.dp)
                            .testTag("log_intervention_button"),
                        colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                    ) {
                        Icon(Icons.Default.AddComment, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Log Action")
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
            // Section Switcher
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = selectedSection == "Section B (2nd Year)",
                        onClick = { selectedSection = "Section B (2nd Year)" },
                        label = { Text("Section B (45 Students)") }
                    )
                    FilterChip(
                        selected = selectedSection == "Section A (2nd Year)",
                        onClick = { selectedSection = "Section A (2nd Year)" },
                        label = { Text("Section A (48 Students)") }
                    )
                }
            }

            // 1. Class Risk Distribution & Prediction Overview (SRS-F-110 & FSD B.1)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Class Risk Distribution",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                            )
                            Text(
                                text = "Avg Pred: 71.4%",
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                color = BrandPrimary
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))

                        // Visual distribution bar
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(12.dp)
                                .clip(RoundedCornerShape(6.dp))
                        ) {
                            Box(modifier = Modifier.weight(5f).fillMaxHeight().background(RiskHigh))
                            Box(modifier = Modifier.weight(14f).fillMaxHeight().background(RiskMedium))
                            Box(modifier = Modifier.weight(26f).fillMaxHeight().background(RiskLow))
                        }
                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(RiskHigh))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("5 High Risk (-2 WoW)", style = MaterialTheme.typography.labelSmall)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(RiskMedium))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("14 Medium", style = MaterialTheme.typography.labelSmall)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(RiskLow))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("26 Low (On Track)", style = MaterialTheme.typography.labelSmall)
                            }
                        }
                    }
                }
            }

            // 2. Priority At-Risk Students (SRS-F-111 & FSD B.2)
            item {
                SectionHeader(
                    title = "At-Risk Students Requiring Intervention",
                    subtitle = "Scoped to $selectedSection • Ranked by Risk Index"
                )
            }

            item {
                // Rahul Sharma priority card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Rahul Sharma",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                                )
                                Text(
                                    text = "ENR-2024-8842 • Risk Index: 73.5",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            RiskBadge(tier = RiskTier.HIGH)
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "Top Risk Driver: Probability & Statistics mastery at 44% + Attendance at 78% (18 days to internal assessment).",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = {
                                    selectedStudentForIntervention = "Rahul Sharma (ENR-2024-8842)"
                                    showInterventionDialog = true
                                },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Log Meeting")
                            }
                            Button(
                                onClick = {
                                    viewModel.switchStudent("rahul_001")
                                    viewModel.setRole(com.example.data.model.UserRole.STUDENT)
                                },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                            ) {
                                Text("View Student Plan")
                            }
                        }
                    }
                }
            }

            // 3. Class-Level Topic Difficulty Heatmap (SRS-F-112 & FSD B.3)
            item {
                SectionHeader(
                    title = "Systemic Weak Topics (% Below Moderate)",
                    subtitle = "Identifies curriculum units where majority struggle"
                )
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        TopicDifficultyRow(
                            topicName = "Probability & Statistics",
                            percentBelowModerate = 42,
                            remedy = "Review tutorial problem set 4 in upcoming lecture"
                        )
                        TopicDifficultyRow(
                            topicName = "Calculus & Integration",
                            percentBelowModerate = 38,
                            remedy = "Post supplemental video on integration by parts"
                        )
                        TopicDifficultyRow(
                            topicName = "Matrices & Linear Algebra",
                            percentBelowModerate = 14,
                            remedy = "Cohort performing well (safe)"
                        )
                    }
                }
            }

            // 4. Immutable Intervention History Log (SRS-F-113 & FSD B.4)
            item {
                SectionHeader(
                    title = "Intervention Audit History",
                    subtitle = "Immutable record of faculty actions taken"
                )
            }

            if (interventions.isEmpty()) {
                item {
                    Text("No faculty interventions logged yet.", style = MaterialTheme.typography.bodySmall)
                }
            } else {
                items(interventions) { log ->
                    val dateFormatted = remember(log.loggedAt) {
                        SimpleDateFormat("MMM dd, yyyy • hh:mm a", Locale.getDefault()).format(Date(log.loggedAt))
                    }
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "${log.facultyName} • ${log.category.replace('_', ' ')}",
                                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                    color = BrandPrimary
                                )
                                Text(dateFormatted, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Student: ${log.studentId} • Note: ${log.note}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }
    }

    // Intervention Logging Modal Dialog (SRS-F-113)
    if (showInterventionDialog) {
        val categories = listOf(
            "MET_WITH_STUDENT" to "1-on-1 Academic Advising Meeting",
            "OFFERED_REMEDIAL" to "Assigned Remedial Practice Pack",
            "EXTENDED_DEADLINE" to "Granted Assessment Extension",
            "NOTIFIED_MENTOR" to "Escalated to Department Mentor"
        )
        AlertDialog(
            onDismissRequest = { showInterventionDialog = false },
            title = { Text("Record Faculty Intervention") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Target: $selectedStudentForIntervention", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
                    Text("Select Intervention Action:", style = MaterialTheme.typography.labelSmall)
                    categories.forEach { (catKey, catLabel) ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { interventionCategory = catKey }
                        ) {
                            RadioButton(
                                selected = interventionCategory == catKey,
                                onClick = { interventionCategory = catKey }
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(catLabel, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                    OutlinedTextField(
                        value = interventionNote,
                        onValueChange = { interventionNote = it },
                        label = { Text("Intervention Notes / Guidance") },
                        placeholder = { Text("e.g. Advised student on Bayes rule exercises...") },
                        modifier = Modifier.fillMaxWidth().testTag("intervention_note_input")
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.logIntervention(
                            category = interventionCategory,
                            note = interventionNote.ifBlank { "Met with student to review risk factors." },
                            facultyName = "Dr. R. Iyer"
                        )
                        interventionNote = ""
                        showInterventionDialog = false
                    },
                    modifier = Modifier.testTag("save_intervention_record_button")
                ) {
                    Text("Save to Audit Log")
                }
            },
            dismissButton = {
                TextButton(onClick = { showInterventionDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun TopicDifficultyRow(
    topicName: String,
    percentBelowModerate: Int,
    remedy: String
) {
    val barColor = if (percentBelowModerate > 30) RiskHigh else RiskLow
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(topicName, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
            Text(
                text = "$percentBelowModerate% of class below moderate",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = barColor
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(Color(0xFFE5E7EB))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(percentBelowModerate.toFloat() / 100f)
                    .clip(RoundedCornerShape(3.dp))
                    .background(barColor)
            )
        }
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = "Suggested Action: $remedy",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
