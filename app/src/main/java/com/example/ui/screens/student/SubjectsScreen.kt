package com.example.ui.screens.student

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.example.data.local.SubjectEntity
import com.example.data.model.ConfidenceLevel
import com.example.data.model.DriverFactor
import com.example.data.model.MasteryClassification
import com.example.data.model.RiskTier
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.LearnSenseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SubjectsScreen(
    viewModel: LearnSenseViewModel,
    onBack: () -> Unit,
    onNavigateToQuiz: (String) -> Unit,
    onNavigateToTopics: () -> Unit,
    modifier: Modifier = Modifier
) {
    val subjects by viewModel.subjects.collectAsState()
    val driverFactors by viewModel.driverFactors.collectAsState()
    val topicsMastery by viewModel.topicsMastery.collectAsState()

    var expandedSubjectId by remember { mutableStateOf<String?>("math_201") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Subject Analytics",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "Performance Drivers & Grade Bands",
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 12.dp)
        ) {
            item {
                Text(
                    text = "Enrolled Curriculum & Prediction Drivers",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            items(subjects) { subject ->
                val isExpanded = expandedSubjectId == subject.id
                val tier = when (subject.riskTier) {
                    "HIGH" -> RiskTier.HIGH
                    "MEDIUM" -> RiskTier.MEDIUM
                    else -> RiskTier.LOW
                }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("subject_card_${subject.id}")
                        .clickable {
                            expandedSubjectId = if (isExpanded) null else subject.id
                        },
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = subject.name,
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "${subject.code} • ${subject.department} • ${subject.credits} Credits",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            RiskBadge(tier = tier)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Predicted band indicator
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Predicted Range",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "${String.format("%.0f", subject.predictedRangeLow)}% – ${String.format("%.0f", subject.predictedRangeHigh)}%",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = BrandPrimary
                                )
                            }
                            ConfidenceBadge(confidence = ConfidenceLevel.HIGH)
                            Icon(
                                imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                                contentDescription = if (isExpanded) "Collapse" else "Expand",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        // Expanded Analytics Details (FSD A.4: Subject Analytics)
                        AnimatedVisibility(visible = isExpanded) {
                            Column(modifier = Modifier.padding(top = 16.dp)) {
                                HorizontalDivider(color = Color(0xFFD1D5DB), thickness = 1.dp)
                                Spacer(modifier = Modifier.height(14.dp))

                                Text(
                                    text = "Why this prediction? (SRS-F-050 & SRS-F-051)",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Plain-language diagnosis: Lower quiz accuracy on foundational probability (-14%) and attendance of 78% (-8%) constrain your ceiling. Strong matrix algebra skills (+15%) provide stability.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )

                                Spacer(modifier = Modifier.height(12.dp))
                                Text(
                                    text = "Quantified Driver Factors",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(modifier = Modifier.height(6.dp))

                                // Driver factor magnitude bars
                                driverFactors.forEach { factor ->
                                    DriverFactorBar(factor = factor)
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                // Academic Records Breakdown table
                                Text(
                                    text = "Recent Marks History",
                                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                                )
                                Spacer(modifier = Modifier.height(8.dp))

                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                        .padding(10.dp),
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text("Midterm 1: Matrices & Calc", style = MaterialTheme.typography.bodySmall)
                                        Text("18 / 30 (60%)", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold))
                                    }
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text("Quiz 1: Probability Basics", style = MaterialTheme.typography.bodySmall)
                                        Text("8 / 20 (40%)", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold, color = RiskHigh))
                                    }
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text("Assignment 2: Linear Systems", style = MaterialTheme.typography.bodySmall)
                                        Text("24 / 25 (96%)", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold, color = RiskLow))
                                    }
                                }

                                Spacer(modifier = Modifier.height(14.dp))

                                // Action Buttons
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    OutlinedButton(
                                        onClick = onNavigateToTopics,
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Text("View Topics")
                                    }
                                    Button(
                                        onClick = { onNavigateToQuiz("math_prob") },
                                        modifier = Modifier.weight(1f).testTag("practice_subject_button"),
                                        colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                                    ) {
                                        Icon(Icons.Default.FitnessCenter, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Adaptive Quiz")
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
