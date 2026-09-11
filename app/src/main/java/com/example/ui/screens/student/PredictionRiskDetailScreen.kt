package com.example.ui.screens.student

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import com.example.data.model.ConfidenceLevel
import com.example.data.model.DriverFactor
import com.example.data.model.RiskTier
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.LearnSenseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PredictionRiskDetailScreen(
    viewModel: LearnSenseViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val healthSummary by viewModel.healthSummary.collectAsState()
    val driverFactors by viewModel.driverFactors.collectAsState()

    var showFlagDialog by remember { mutableStateOf(false) }
    var flagReason by remember { mutableStateOf("Recent assessment score hasn't updated yet") }
    var flagConfirmed by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Prediction & Risk Detail",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "Model Drivers & Transparent Breakdown",
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
            // 1. Constructive Risk Explanation Banner (SRS-NFR-U01)
            item {
                val summary = healthSummary
                val riskTier = summary?.overallRiskTier ?: RiskTier.HIGH
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Academic Risk Index",
                                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "${String.format("%.1f", summary?.overallRiskScore ?: 73.5)} / 100",
                                    style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                                    color = when (riskTier) {
                                        RiskTier.HIGH -> RiskHigh
                                        RiskTier.MEDIUM -> RiskMedium
                                        RiskTier.LOW -> RiskLow
                                    }
                                )
                            }
                            RiskBadge(tier = riskTier)
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "💡 Constructive Guidance: This indicator highlights factors that are currently influencing your academic trajectory before final assessments. Early action in Probability and attendance recovery directly shifts your risk status toward Moderate and Low.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            // 2. Predicted Semester Grade Band & Confidence
            item {
                val summary = healthSummary
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text(
                            text = "Predicted Semester Performance Range",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Model version: learn_sense_xgb_v1.4 • Nightly batch recomputed",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "${String.format("%.0f", summary?.predictedRangeLow ?: 62.0)}% – ${String.format("%.0f", summary?.predictedRangeHigh ?: 70.0)}%",
                                style = MaterialTheme.typography.headlineSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = BrandPrimary
                                )
                            )
                            ConfidenceBadge(confidence = summary?.confidence ?: ConfidenceLevel.HIGH)
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        // Visual Band range bar
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(14.dp)
                                .clip(RoundedCornerShape(7.dp))
                                .background(Color(0xFFE5E7EB))
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .fillMaxWidth(0.70f)
                                    .padding(start = 120.dp)
                                    .clip(RoundedCornerShape(7.dp))
                                    .background(
                                        Brush.horizontalGradient(
                                            listOf(Color.Black, Color(0xFF374151))
                                        )
                                    )
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("0%", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("Target Ceiling: 70%", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = Color.Black)
                            Text("100%", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }

            // 3. Driver Factors Breakdown (SRS-F-050)
            item {
                SectionHeader(
                    title = "Primary Prediction Drivers",
                    subtitle = "Signed impact factors derived from gradient-boosted model"
                )
            }

            items(driverFactors.size) { index ->
                val factor = driverFactors[index]
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        DriverFactorBar(factor = factor)
                    }
                }
            }

            // 4. "Flag-as-Wrong" Feedback Flow (SRS-F-142)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = CardDefaults.outlinedCardBorder()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Feedback, contentDescription = null, tint = Color.Black)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Doesn't seem right to you?",
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "If recent assessment scores haven't updated or attendance is inaccurate, report it here for model calibration review.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedButton(
                            onClick = { showFlagDialog = true },
                            modifier = Modifier.testTag("flag_as_wrong_button")
                        ) {
                            Icon(Icons.Default.Flag, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Flag This Prediction")
                        }

                        if (flagConfirmed) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "✓ Thanks — your feedback helps us calibrate models. Scores will update upon next faculty verification.",
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                                color = RiskLow
                            )
                        }
                    }
                }
            }
        }
    }

    // Flag as wrong dialog (FSD A.7)
    if (showFlagDialog) {
        val reasons = listOf(
            "Recent assessment or quiz score hasn't updated yet",
            "Attendance records have a mismatch",
            "Studying outside the system / offline test not reflected",
            "Model underestimating my revision rate"
        )
        AlertDialog(
            onDismissRequest = { showFlagDialog = false },
            title = { Text("Flag Prediction Feedback") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Select what feels inaccurate (this feedback is logged for model auditing):",
                        style = MaterialTheme.typography.bodySmall
                    )
                    reasons.forEach { reason ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { flagReason = reason }
                                .padding(vertical = 4.dp)
                        ) {
                            RadioButton(
                                selected = flagReason == reason,
                                onClick = { flagReason = reason }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(reason, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.flagPrediction(flagReason)
                        showFlagDialog = false
                        flagConfirmed = true
                    }
                ) {
                    Text("Submit Feedback")
                }
            },
            dismissButton = {
                TextButton(onClick = { showFlagDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
