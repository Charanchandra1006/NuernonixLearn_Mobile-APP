package com.example.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.LearningPlanItemEntity
import com.example.ui.components.SectionHeader
import com.example.ui.theme.*
import com.example.ui.viewmodel.LearnSenseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LearningPlanScreen(
    viewModel: LearnSenseViewModel,
    onBack: () -> Unit,
    onNavigateToQuiz: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val activePlan by viewModel.activePlan.collectAsState()
    val planItems by viewModel.planItems.collectAsState()

    val daysOfWeek = listOf("All", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
    var selectedDay by remember { mutableStateOf("All") }

    val filteredItems = remember(planItems, selectedDay) {
        if (selectedDay == "All") planItems else planItems.filter { it.dayOfWeek == selectedDay }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Personalized Learning Plan",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = activePlan?.weekLabel ?: "Dynamic Weekly Itinerary",
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
                actions = {
                    IconButton(
                        onClick = { viewModel.regeneratePlan() },
                        modifier = Modifier.testTag("regenerate_plan_button")
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = "Regenerate Plan", tint = BrandPrimary)
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
            // High Performer Stretch Plan Banner if applicable (SRS-F-062)
            if (activePlan?.isStretchPlan == true) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = CardDefaults.outlinedCardBorder(),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Star, contentDescription = null, tint = Color.Black)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "★ Stretch Plan Activated",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = Color.Black
                                )
                                Text(
                                    text = "Great job maintaining strong mastery! Content has shifted to competitive advanced challenges rather than remedial tasks.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color(0xFF374151)
                                )
                            }
                        }
                    }
                }
            }

            // Day selector tabs
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(bottom = 4.dp)
                ) {
                    items(daysOfWeek) { day ->
                        FilterChip(
                            selected = selectedDay == day,
                            onClick = { selectedDay = day },
                            label = { Text(day) }
                        )
                    }
                }
            }

            // Stats summary row
            item {
                val completedCount = planItems.count { it.status == "COMPLETED" }
                val totalMinutes = filteredItems.sumOf { it.estimatedMinutes }
                Card(
                    modifier = Modifier.fillMaxWidth(),
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
                        Column {
                            Text(
                                text = "Weekly Completion",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "$completedCount / ${planItems.size} Completed",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = RiskLow
                            )
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "Estimated Study Time",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "$totalMinutes mins planned",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = BrandPrimary
                            )
                        }
                    }
                }
            }

            items(filteredItems) { item ->
                LearningPlanItemCard(
                    item = item,
                    onToggleStatus = { viewModel.togglePlanItem(item.id, item.status) },
                    onStartQuiz = { onNavigateToQuiz(item.topicId) }
                )
            }
        }
    }
}

@Composable
fun LearningPlanItemCard(
    item: LearningPlanItemEntity,
    onToggleStatus: () -> Unit,
    onStartQuiz: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isDone = item.status == "COMPLETED"

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("plan_card_${item.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isDone) MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f) else MaterialTheme.colorScheme.surface
        ),
        border = CardDefaults.outlinedCardBorder()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = isDone,
                onCheckedChange = { onToggleStatus() },
                modifier = Modifier.testTag("checkbox_${item.id}")
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = when (item.type) {
                            "QUIZ" -> Color(0xFFFEE2E2)
                            "PRACTICE" -> Color(0xFFFEF3C7)
                            "RESOURCE" -> Color(0xFFE0F2FE)
                            else -> Color(0xFFF1F5F9)
                        },
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = "${item.dayOfWeek} • ${item.type}",
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                            color = when (item.type) {
                                "QUIZ" -> RiskHigh
                                "PRACTICE" -> RiskMedium
                                "RESOURCE" -> BrandSecondary
                                else -> MaterialTheme.colorScheme.onSurfaceVariant
                            },
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "${item.estimatedMinutes} mins",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = if (isDone) FontWeight.Normal else FontWeight.SemiBold
                    ),
                    color = if (isDone) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
                )
            }
            if (item.type == "QUIZ") {
                FilledTonalIconButton(onClick = onStartQuiz) {
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
