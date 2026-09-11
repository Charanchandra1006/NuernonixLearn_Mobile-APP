package com.example.ui.screens.data

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ui.components.SectionHeader
import com.example.ui.theme.*
import com.example.ui.viewmodel.LearnSenseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DataIngestionScreen(
    viewModel: LearnSenseViewModel,
    modifier: Modifier = Modifier
) {
    val activeStudent by viewModel.activeStudent.collectAsState()
    val healthSummary by viewModel.healthSummary.collectAsState()

    var recordType by remember { mutableStateOf("quiz") }
    var recordTitle by remember { mutableStateOf("") }
    var recordScore by remember { mutableStateOf("") }
    var recordMaxScore by remember { mutableStateOf("20") }
    var selectedSubjectId by remember { mutableStateOf("math_201") }
    var recordAddedSuccess by remember { mutableStateOf(false) }

    var attendanceInput by remember { mutableStateOf("82") }
    var attendanceSuccess by remember { mutableStateOf(false) }

    var isCsvProcessing by remember { mutableStateOf(false) }
    var csvReport by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Data Ingestion & Cascade Lab",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "Target: ${activeStudent?.name ?: "Rahul"} • Live Recompute (SRS-F-100)",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
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
            // Recompute banner status
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Bolt, contentDescription = null, tint = Color.Black)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Instant Recompute Cascade Active",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = Color.Black
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Any marks or attendance entered below triggers immediate re-evaluation of mastery (TRD §5), risk score (TRD §4.3), and personalized study plan.",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF374151)
                        )
                    }
                }
            }

            // 1. Manual Assessment Marks Entry (SRS-F-001)
            item {
                SectionHeader(
                    title = "Log New Academic Assessment",
                    subtitle = "Internal test, surprise quiz, or lab assignment"
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
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text("Record Type:", style = MaterialTheme.typography.labelSmall)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            FilterChip(
                                selected = recordType == "quiz",
                                onClick = { recordType = "quiz"; recordMaxScore = "20" },
                                label = { Text("Quiz (Max 20)") }
                            )
                            FilterChip(
                                selected = recordType == "internal",
                                onClick = { recordType = "internal"; recordMaxScore = "30" },
                                label = { Text("Midterm (Max 30)") }
                            )
                            FilterChip(
                                selected = recordType == "assignment",
                                onClick = { recordType = "assignment"; recordMaxScore = "25" },
                                label = { Text("Assignment") }
                            )
                        }

                        OutlinedTextField(
                            value = recordTitle,
                            onValueChange = { recordTitle = it },
                            label = { Text("Assessment Title") },
                            placeholder = { Text("e.g. Surprise Quiz on Bayes Law") },
                            modifier = Modifier.fillMaxWidth().testTag("assessment_title_input")
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedTextField(
                                value = recordScore,
                                onValueChange = { recordScore = it },
                                label = { Text("Score Obtained") },
                                placeholder = { Text("e.g. 17") },
                                modifier = Modifier.weight(1f).testTag("score_obtained_input")
                            )
                            OutlinedTextField(
                                value = recordMaxScore,
                                onValueChange = { recordMaxScore = it },
                                label = { Text("Max Marks") },
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Button(
                            onClick = {
                                val score = recordScore.toDoubleOrNull() ?: 15.0
                                val max = recordMaxScore.toDoubleOrNull() ?: 20.0
                                val title = recordTitle.ifBlank { "Diagnostic Assessment" }
                                viewModel.addManualAcademicRecord(selectedSubjectId, recordType, title, score, max)
                                recordScore = ""
                                recordTitle = ""
                                recordAddedSuccess = true
                            },
                            modifier = Modifier.fillMaxWidth().testTag("submit_assessment_record_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                        ) {
                            Icon(Icons.Default.Save, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Submit & Recompute Trajectory")
                        }

                        if (recordAddedSuccess) {
                            Text(
                                text = "✓ Record logged! Prediction and risk score recomputed.",
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                color = RiskLow
                            )
                        }
                    }
                }
            }

            // 2. Attendance Updater (SRS-F-002)
            item {
                SectionHeader(
                    title = "Update Subject Attendance %",
                    subtitle = "Simulate attendance recovery above 75% cutoff"
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
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Current Average: ${String.format("%.1f", healthSummary?.attendanceAverage ?: 78.0)}%",
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold)
                        )
                        OutlinedTextField(
                            value = attendanceInput,
                            onValueChange = { attendanceInput = it },
                            label = { Text("New Attendance Percentage (%)") },
                            placeholder = { Text("e.g. 85") },
                            modifier = Modifier.fillMaxWidth().testTag("attendance_percentage_input")
                        )
                        Button(
                            onClick = {
                                val newPct = attendanceInput.toDoubleOrNull() ?: 80.0
                                viewModel.updateStudentAttendance(selectedSubjectId, newPct)
                                attendanceSuccess = true
                            },
                            modifier = Modifier.fillMaxWidth().testTag("update_attendance_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = BrandSecondary)
                        ) {
                            Text("Update Attendance & Trigger Cascade")
                        }
                        if (attendanceSuccess) {
                            Text(
                                text = "✓ Attendance updated! Risk score driver factors adjusted.",
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                color = RiskLow
                            )
                        }
                    }
                }
            }

            // 3. CSV Bulk Upload Simulator (SRS-DATA-01)
            item {
                SectionHeader(
                    title = "CSV Bulk Roster Import",
                    subtitle = "Simulate SIS/ERP batch sync (SRS-DATA-01)"
                )
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Batch Import with Pre-Validation",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Validates enrollment IDs, scale ranges (0-100), and missing required columns before writing to database.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedButton(
                            onClick = {
                                isCsvProcessing = true
                                csvReport = "Validation Report: 48 rows analyzed • 48 Valid • 0 Format Errors. Ready to commit."
                                isCsvProcessing = false
                            },
                            modifier = Modifier.fillMaxWidth().testTag("validate_csv_button")
                        ) {
                            Icon(Icons.Default.UploadFile, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Simulate CSV Batch Validation")
                        }

                        csvReport?.let { report ->
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = report,
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
                                color = RiskLow
                            )
                        }
                    }
                }
            }
        }
    }
}
