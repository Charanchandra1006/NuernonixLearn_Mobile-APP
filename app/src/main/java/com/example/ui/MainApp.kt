package com.example.ui

import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.EventNote
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.UserRole
import com.example.ui.screens.admin.AdminConsoleScreen
import com.example.ui.screens.data.DataIngestionScreen
import com.example.ui.screens.faculty.FacultyDashboardScreen
import com.example.ui.screens.student.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.LearnSenseViewModel

enum class StudentTab(val label: String, val icon: ImageVector) {
    DASHBOARD("Home", Icons.Default.Dashboard),
    SUBJECTS("Subjects", Icons.AutoMirrored.Filled.MenuBook),
    MASTERY("Mastery", Icons.Default.Analytics),
    PLAN("Plan", Icons.AutoMirrored.Filled.EventNote),
    AI_TUTOR("AI Tutor", Icons.Default.AutoAwesome)
}

enum class SubScreen {
    NONE,
    QUIZ,
    RISK_DETAIL,
    DATA_INGESTION
}

@Composable
fun MainApp(
    viewModel: LearnSenseViewModel,
    modifier: Modifier = Modifier
) {
    val currentRole by viewModel.currentRole.collectAsState()
    var selectedStudentTab by remember { mutableStateOf(StudentTab.DASHBOARD) }
    var currentSubScreen by remember { mutableStateOf(SubScreen.NONE) }
    var activeQuizTopicId by remember { mutableStateOf("math_prob") }

    Scaffold(
        topBar = {
            // Role & Portal Switcher Header Bar (White background, Black text, crisp border)
            Surface(
                color = Color.White,
                shadowElevation = 1.dp,
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFD1D5DB))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "LearnSense",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            RolePill(
                                label = "Student",
                                isSelected = currentRole == UserRole.STUDENT,
                                onClick = {
                                    viewModel.setRole(UserRole.STUDENT)
                                    currentSubScreen = SubScreen.NONE
                                }
                            )
                            RolePill(
                                label = "Faculty",
                                isSelected = currentRole == UserRole.FACULTY,
                                onClick = {
                                    viewModel.setRole(UserRole.FACULTY)
                                    currentSubScreen = SubScreen.NONE
                                }
                            )
                            RolePill(
                                label = "Admin",
                                isSelected = currentRole == UserRole.ADMIN,
                                onClick = {
                                    viewModel.setRole(UserRole.ADMIN)
                                    currentSubScreen = SubScreen.NONE
                                }
                            )
                            RolePill(
                                label = "Data Lab",
                                isSelected = currentSubScreen == SubScreen.DATA_INGESTION,
                                onClick = {
                                    currentSubScreen = SubScreen.DATA_INGESTION
                                }
                            )
                        }
                    }
                }
            }
        },
        bottomBar = {
            if (currentRole == UserRole.STUDENT && currentSubScreen == SubScreen.NONE) {
                Column {
                    HorizontalDivider(color = Color(0xFFD1D5DB), thickness = 1.dp)
                    NavigationBar(
                        containerColor = Color.White,
                        tonalElevation = 1.dp
                    ) {
                        StudentTab.values().forEach { tab ->
                            val selected = selectedStudentTab == tab
                            NavigationBarItem(
                                selected = selected,
                                onClick = { selectedStudentTab = tab },
                                icon = {
                                    Icon(
                                        imageVector = tab.icon,
                                        contentDescription = tab.label
                                    )
                                },
                                label = {
                                    Text(
                                        text = tab.label,
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                        )
                                    )
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = Color.Black,
                                    selectedTextColor = Color.Black,
                                    unselectedIconColor = Color(0xFF6B7280),
                                    unselectedTextColor = Color(0xFF6B7280),
                                    indicatorColor = Color(0xFFF3F4F6)
                                ),
                                modifier = Modifier.testTag("nav_tab_${tab.name.lowercase()}")
                            )
                        }
                    }
                }
            }
        },
        modifier = modifier
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when {
                currentSubScreen == SubScreen.QUIZ -> {
                    AdaptiveQuizScreen(
                        viewModel = viewModel,
                        topicId = activeQuizTopicId,
                        onBack = { currentSubScreen = SubScreen.NONE },
                        onNavigateToAiAssistant = {
                            currentSubScreen = SubScreen.NONE
                            selectedStudentTab = StudentTab.AI_TUTOR
                        }
                    )
                }
                currentSubScreen == SubScreen.RISK_DETAIL -> {
                    PredictionRiskDetailScreen(
                        viewModel = viewModel,
                        onBack = { currentSubScreen = SubScreen.NONE }
                    )
                }
                currentSubScreen == SubScreen.DATA_INGESTION -> {
                    DataIngestionScreen(
                        viewModel = viewModel
                    )
                }
                currentRole == UserRole.FACULTY -> {
                    FacultyDashboardScreen(viewModel = viewModel)
                }
                currentRole == UserRole.ADMIN -> {
                    AdminConsoleScreen(viewModel = viewModel)
                }
                else -> {
                    Crossfade(targetState = selectedStudentTab, label = "StudentTabCrossfade") { tab ->
                        when (tab) {
                            StudentTab.DASHBOARD -> DashboardScreen(
                                viewModel = viewModel,
                                onNavigateToSubjects = { selectedStudentTab = StudentTab.SUBJECTS },
                                onNavigateToTopics = { selectedStudentTab = StudentTab.MASTERY },
                                onNavigateToPlan = { selectedStudentTab = StudentTab.PLAN },
                                onNavigateToQuiz = { topic ->
                                    activeQuizTopicId = topic
                                    currentSubScreen = SubScreen.QUIZ
                                },
                                onNavigateToRiskDetail = { currentSubScreen = SubScreen.RISK_DETAIL },
                                onNavigateToAiAssistant = { selectedStudentTab = StudentTab.AI_TUTOR }
                            )
                            StudentTab.SUBJECTS -> SubjectsScreen(
                                viewModel = viewModel,
                                onBack = { selectedStudentTab = StudentTab.DASHBOARD },
                                onNavigateToQuiz = { topic ->
                                    activeQuizTopicId = topic
                                    currentSubScreen = SubScreen.QUIZ
                                },
                                onNavigateToTopics = { selectedStudentTab = StudentTab.MASTERY }
                            )
                            StudentTab.MASTERY -> TopicMasteryScreen(
                                viewModel = viewModel,
                                onBack = { selectedStudentTab = StudentTab.DASHBOARD },
                                onStartPractice = { topic ->
                                    activeQuizTopicId = topic
                                    currentSubScreen = SubScreen.QUIZ
                                }
                            )
                            StudentTab.PLAN -> LearningPlanScreen(
                                viewModel = viewModel,
                                onBack = { selectedStudentTab = StudentTab.DASHBOARD },
                                onNavigateToQuiz = { topic ->
                                    activeQuizTopicId = topic
                                    currentSubScreen = SubScreen.QUIZ
                                }
                            )
                            StudentTab.AI_TUTOR -> AiAssistantScreen(
                                viewModel = viewModel,
                                onBack = { selectedStudentTab = StudentTab.DASHBOARD }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun RolePill(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        color = if (isSelected) Color.Black else Color.White,
        shape = MaterialTheme.shapes.small,
        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Color.Black else Color(0xFFD1D5DB)),
        modifier = Modifier.testTag("role_pill_${label.lowercase().replace(" ", "_")}")
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                fontSize = 11.sp
            ),
            color = if (isSelected) Color.White else Color.Black,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}
