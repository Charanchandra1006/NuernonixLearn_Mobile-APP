package com.example.ui.screens.student

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import com.example.data.local.TopicMasteryEntity
import com.example.data.model.MasteryClassification
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.LearnSenseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopicMasteryScreen(
    viewModel: LearnSenseViewModel,
    onBack: () -> Unit,
    onStartPractice: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val allMastery by viewModel.topicsMastery.collectAsState()
    var selectedFilter by remember { mutableStateOf("WEAK_FIRST") }
    var expandedTopicId by remember { mutableStateOf<String?>("math_prob") }

    val filteredList = remember(allMastery, selectedFilter) {
        when (selectedFilter) {
            "WEAK_FIRST" -> allMastery.sortedWith(
                compareBy {
                    when (it.classification) {
                        "WEAK" -> 0
                        "NOT_YET_ASSESSED" -> 1
                        "MODERATE" -> 2
                        else -> 3
                    }
                }
            )
            "WEAK" -> allMastery.filter { it.classification == "WEAK" }
            "STRONG" -> allMastery.filter { it.classification == "STRONG" }
            "MODERATE" -> allMastery.filter { it.classification == "MODERATE" }
            "NOT_ASSESSED" -> allMastery.filter { it.classification == "NOT_YET_ASSESSED" }
            else -> allMastery
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Topic Mastery Matrix",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "Concept Understanding & Practice Stability",
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
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(vertical = 12.dp)
        ) {
            // Filter chips (Weak-first default per FSD A.6)
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(bottom = 4.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedFilter == "WEAK_FIRST",
                            onClick = { selectedFilter = "WEAK_FIRST" },
                            label = { Text("Weak-First (Default)") },
                            leadingIcon = {
                                if (selectedFilter == "WEAK_FIRST") Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                            }
                        )
                    }
                    item {
                        FilterChip(
                            selected = selectedFilter == "WEAK",
                            onClick = { selectedFilter = "WEAK" },
                            label = { Text("Needs Attention") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = selectedFilter == "STRONG",
                            onClick = { selectedFilter = "STRONG" },
                            label = { Text("Strong") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = selectedFilter == "MODERATE",
                            onClick = { selectedFilter = "MODERATE" },
                            label = { Text("Moderate") }
                        )
                    }
                    item {
                        FilterChip(
                            selected = selectedFilter == "NOT_ASSESSED",
                            onClick = { selectedFilter = "NOT_ASSESSED" },
                            label = { Text("Not Yet Assessed") }
                        )
                    }
                }
            }

            items(filteredList) { topic ->
                val classification = when (topic.classification) {
                    "STRONG" -> MasteryClassification.STRONG
                    "MODERATE" -> MasteryClassification.MODERATE
                    "WEAK" -> MasteryClassification.WEAK
                    else -> MasteryClassification.NOT_YET_ASSESSED
                }
                val isExpanded = expandedTopicId == topic.topicId

                val topicDisplayTitle = when (topic.topicId) {
                    "math_prob" -> "Probability & Statistics"
                    "math_calc" -> "Calculus & Integration"
                    "math_matrices" -> "Matrices & Linear Algebra"
                    "math_diff" -> "Differential Equations"
                    "cs_trees" -> "Binary Trees & BST"
                    "cs_graphs" -> "Graph Algorithms (BFS/DFS)"
                    "cs_dp" -> "Dynamic Programming"
                    "os_mem" -> "Virtual Memory & Paging"
                    "os_sync" -> "Process Synchronization"
                    "os_sched" -> "CPU Scheduling"
                    else -> topic.topicId
                }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("topic_item_${topic.topicId}")
                        .clickable {
                            expandedTopicId = if (isExpanded) null else topic.topicId
                        },
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
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = topicDisplayTitle,
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "${topic.subjectId.uppercase()} • ${topic.attemptsCount} attempts",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            MasteryBadge(classification = classification)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Score progress bar
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            if (topic.masteryScore != null) {
                                Text(
                                    text = "Mastery Score: ${String.format("%.0f", topic.masteryScore)}%",
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                    color = when (classification) {
                                        MasteryClassification.STRONG -> RiskLow
                                        MasteryClassification.MODERATE -> RiskMedium
                                        MasteryClassification.WEAK -> RiskHigh
                                        else -> MasteryNotAssessed
                                    }
                                )
                            } else {
                                Text(
                                    text = "No diagnostic attempts yet",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MasteryNotAssessed
                                )
                            }
                            Icon(
                                imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        // Expanded: 3 Sub-Metrics Breakdown (TRD §5 & PRD §12)
                        AnimatedVisibility(visible = isExpanded) {
                            Column(modifier = Modifier.padding(top = 14.dp)) {
                                HorizontalDivider(color = Color(0xFFD1D5DB), thickness = 1.dp)
                                Spacer(modifier = Modifier.height(12.dp))

                                Text(
                                    text = "Mastery Score Components (TRD §5 formula: 0.4·Understanding + 0.4·Practice + 0.2·Stability)",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )

                                Spacer(modifier = Modifier.height(10.dp))

                                // Sub-metric 1: Concept Understanding
                                SubMetricRow(
                                    name = "Concept Understanding",
                                    subtitle = "First-attempt question accuracy",
                                    percentage = topic.conceptUnderstanding,
                                    barColor = BrandPrimary
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                // Sub-metric 2: Practice Accuracy
                                SubMetricRow(
                                    name = "Practice Accuracy",
                                    subtitle = "Recency-weighted problem accuracy",
                                    percentage = topic.practiceAccuracy,
                                    barColor = BrandSecondary
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                // Sub-metric 3: Revision Stability
                                SubMetricRow(
                                    name = "Revision Stability",
                                    subtitle = "Spaced repetition retention decay curve",
                                    percentage = topic.revisionStability,
                                    barColor = BrandTertiary
                                )

                                Spacer(modifier = Modifier.height(14.dp))

                                Button(
                                    onClick = { onStartPractice(topic.topicId) },
                                    modifier = Modifier.fillMaxWidth().testTag("practice_topic_cta_${topic.topicId}"),
                                    colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
                                ) {
                                    Icon(Icons.Default.Quiz, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Practice This Topic (Adaptive Quiz)")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SubMetricRow(
    name: String,
    subtitle: String,
    percentage: Double,
    barColor: Color
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = name, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium))
                Text(text = subtitle, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Text(
                text = "${String.format("%.0f", percentage)}%",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
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
                    .fillMaxWidth((percentage.toFloat() / 100f).coerceIn(0f, 1f))
                    .clip(RoundedCornerShape(3.dp))
                    .background(barColor)
            )
        }
    }
}
