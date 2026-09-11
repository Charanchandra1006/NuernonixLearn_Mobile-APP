package com.example.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.example.ui.components.SectionHeader
import com.example.ui.theme.*
import com.example.ui.viewmodel.LearnSenseViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminConsoleScreen(
    viewModel: LearnSenseViewModel,
    modifier: Modifier = Modifier
) {
    var isExporting by remember { mutableStateOf(false) }
    var exportCompleted by remember { mutableStateOf(false) }
    var showTaxonomyDialog by remember { mutableStateOf(false) }
    var syllabusTextInput by remember { mutableStateOf("") }
    var suggestedTopics by remember { mutableStateOf<List<String>>(emptyList()) }
    val coroutineScope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Institutional Admin Console",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = BrandPrimaryContainer,
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = "System Admin",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = BrandPrimary,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = "Department of Computer Science & Engineering",
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
            // 1. Cohort Performance Overview (SRS-F-120 & FSD C.1)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text(
                            text = "Cohort Enrollment & Model Coverage",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Active Students", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text("240 Enrolled", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
                            }
                            Column {
                                Text("High Risk", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text("18 Students (7.5%)", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = RiskHigh))
                            }
                            Column {
                                Text("Model Pipeline", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text("v1.4 (Active)", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = RiskLow))
                            }
                        }
                    }
                }
            }

            // 2. Fairness & Demographic Parity Audit Panel (SRS-NFR-F01 & PRD-TRUST-04)
            item {
                SectionHeader(
                    title = "Algorithmic Fairness & Parity Metrics",
                    subtitle = "Verified across student demographic cohorts (SRS-NFR-F01)"
                )
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4)),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Demographic Parity Ratio: 0.96",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                color = RiskLow
                            )
                            Surface(color = RiskLowContainer, shape = RoundedCornerShape(6.dp)) {
                                Text("PASSED (>0.80)", color = RiskLow, style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                            }
                        }
                        Text(
                            text = "False Positive Rate across intake cohorts differs by less than 2.4% (standard tolerance is < 5%). No systemic disparate impact detected.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        HorizontalDivider(color = Color(0xFFD1D5DB), thickness = 1.dp)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Brier Calibration Score: 0.084 (Well-calibrated)", style = MaterialTheme.typography.labelSmall)
                            Text("Audited: Today", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
            }

            // 3. Topic Taxonomy Authoring (SRS-F-010 & SRS-F-011)
            item {
                SectionHeader(
                    title = "Curriculum Taxonomy Management",
                    subtitle = "Author topics and dependency relationships"
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
                            text = "AI-Powered Topic Taxonomy Generator (SRS-F-011)",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Paste course syllabus fragments to automatically extract topics, Bloom taxonomy levels, and prerequisite dependency graphs.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = { showTaxonomyDialog = true },
                            modifier = Modifier.testTag("ai_suggest_topics_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                        ) {
                            Icon(Icons.Default.AutoFixHigh, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Extract Topics from Syllabus")
                        }
                    }
                }
            }

            // 4. Report Generation & Export (SRS-F-122 & FSD C.5)
            item {
                SectionHeader(
                    title = "Accreditation & Departmental Reporting",
                    subtitle = "Export longitudinal analytics for NAAC / ABET audits"
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
                            text = "Comprehensive Accreditation Audit Export",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Generates PDF & CSV summary containing topic difficulty distribution, intervention audit trail, and prediction accuracy logs.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(14.dp))

                        if (isExporting) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                                Text("Generating asynchronous audit bundle...", style = MaterialTheme.typography.bodySmall)
                            }
                        } else {
                            Button(
                                onClick = {
                                    isExporting = true
                                    coroutineScope.launch {
                                        delay(1500)
                                        isExporting = false
                                        exportCompleted = true
                                    }
                                },
                                modifier = Modifier.testTag("export_report_button"),
                                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                            ) {
                                Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Generate Audit Report (CSV / PDF)")
                            }
                        }

                        if (exportCompleted) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Surface(
                                color = RiskLowContainer,
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = RiskLow, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "Report generated: LearnSense_ABET_Audit_2026.pdf (Ready for download)",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = RiskLow
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // AI Topic Extraction Dialog (SRS-F-011)
    if (showTaxonomyDialog) {
        AlertDialog(
            onDismissRequest = { showTaxonomyDialog = false },
            title = { Text("Extract Topics from Course Syllabus") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Paste text from syllabus or click 'Use Sample':",
                        style = MaterialTheme.typography.bodySmall
                    )
                    OutlinedTextField(
                        value = syllabusTextInput,
                        onValueChange = { syllabusTextInput = it },
                        placeholder = { Text("e.g. Unit 3: Random variables, joint distributions, Central Limit Theorem...") },
                        modifier = Modifier.fillMaxWidth().height(100.dp)
                    )
                    TextButton(
                        onClick = {
                            syllabusTextInput = "Unit IV: Probability, Bayes Rule, Discrete & Continuous Random Variables, Normal Distribution, Central Limit Theorem."
                        }
                    ) {
                        Text("Fill Sample Syllabus")
                    }

                    if (suggestedTopics.isNotEmpty()) {
                        Text("Extracted Candidate Topics:", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
                        suggestedTopics.forEach { topic ->
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = RiskLow, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(topic, style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (suggestedTopics.isEmpty()) {
                            suggestedTopics = listOf(
                                "Bayes' Rule & Prior Probabilities (Difficulty: Medium)",
                                "Discrete Random Variables (Difficulty: Easy)",
                                "Normal Distribution & Z-Score (Difficulty: Medium)",
                                "Central Limit Theorem (Difficulty: Hard)"
                            )
                        } else {
                            showTaxonomyDialog = false
                            suggestedTopics = emptyList()
                        }
                    }
                ) {
                    Text(if (suggestedTopics.isEmpty()) "Extract Topics" else "Import Selected")
                }
            },
            dismissButton = {
                TextButton(onClick = { showTaxonomyDialog = false }) {
                    Text("Close")
                }
            }
        )
    }
}
