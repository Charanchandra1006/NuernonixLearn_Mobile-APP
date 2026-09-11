package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingDown
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ConfidenceLevel
import com.example.data.model.DriverFactor
import com.example.data.model.MasteryClassification
import com.example.data.model.RiskTier
import com.example.ui.theme.*

@Composable
fun RiskBadge(tier: RiskTier, modifier: Modifier = Modifier) {
    val (bg, textColor, icon) = when (tier) {
        RiskTier.HIGH -> Triple(RiskHighContainer, RiskHigh, Icons.Default.WarningAmber)
        RiskTier.MEDIUM -> Triple(RiskMediumContainer, RiskMedium, Icons.AutoMirrored.Filled.TrendingDown)
        RiskTier.LOW -> Triple(RiskLowContainer, RiskLow, Icons.Default.CheckCircle)
    }

    Surface(
        color = bg,
        shape = RoundedCornerShape(12.dp),
        modifier = modifier
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = textColor,
                modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = tier.label,
                color = textColor,
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold)
            )
        }
    }
}

@Composable
fun MasteryBadge(classification: MasteryClassification, modifier: Modifier = Modifier) {
    val (bg, textColor) = when (classification) {
        MasteryClassification.STRONG -> Pair(RiskLowContainer, RiskLow)
        MasteryClassification.MODERATE -> Pair(RiskMediumContainer, RiskMedium)
        MasteryClassification.WEAK -> Pair(RiskHighContainer, RiskHigh)
        MasteryClassification.NOT_YET_ASSESSED -> Pair(MasteryNotAssessedContainer, MasteryNotAssessed)
    }

    Surface(
        color = bg,
        shape = RoundedCornerShape(8.dp),
        modifier = modifier
    ) {
        Text(
            text = classification.label,
            color = textColor,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.SemiBold,
                fontSize = 11.sp
            ),
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun ConfidenceBadge(confidence: ConfidenceLevel, modifier: Modifier = Modifier) {
    val (bg, textColor, text) = when (confidence) {
        ConfidenceLevel.HIGH -> Triple(Color(0xFFE0F2FE), Color(0xFF0369A1), "High Confidence")
        ConfidenceLevel.MEDIUM -> Triple(Color(0xFFFEF3C7), Color(0xFFB45309), "Medium Confidence")
        ConfidenceLevel.LOW -> Triple(Color(0xFFFEE2E2), Color(0xFFB91C1C), "Low Confidence")
        ConfidenceLevel.COLD_START -> Triple(Color(0xFFF1F5F9), Color(0xFF475569), "Preliminary (Cold-Start)")
    }

    Surface(
        color = bg,
        shape = RoundedCornerShape(8.dp),
        modifier = modifier
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(textColor)
            )
            Spacer(modifier = Modifier.width(5.dp))
            Text(
                text = text,
                color = textColor,
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium)
            )
        }
    }
}

@Composable
fun DriverFactorBar(factor: DriverFactor, modifier: Modifier = Modifier) {
    val isPositive = factor.direction.lowercase() == "up"
    val barColor = if (isPositive) RiskLow else RiskHigh
    val animatedProgress by animateFloatAsState(
        targetValue = (factor.magnitudePct.toFloat() / 35f).coerceIn(0.1f, 1f),
        label = "factorProgress"
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = if (isPositive) Icons.Default.ArrowUpward else Icons.Default.ArrowDownward,
                    contentDescription = null,
                    tint = barColor,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = factor.factorName,
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
            Text(
                text = "${if (isPositive) "+" else "-"}${factor.magnitudePct}% impact",
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
                    .fillMaxWidth(animatedProgress)
                    .clip(RoundedCornerShape(3.dp))
                    .background(barColor)
            )
        }
        if (factor.description.isNotBlank()) {
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = factor.description,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        shape = RoundedCornerShape(16.dp),
        border = CardDefaults.outlinedCardBorder()
    ) {
        Column(
            modifier = Modifier.padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(accentColor.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = accentColor,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 22.sp
                ),
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun SectionHeader(
    title: String,
    subtitle: String? = null,
    actionText: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        if (actionText != null && onAction != null) {
            TextButton(onClick = onAction) {
                Text(
                    text = actionText,
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold)
                )
            }
        }
    }
}
