package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val WhiteBgBlackTextColorScheme = lightColorScheme(
    primary = Color.Black,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFF3F4F6),
    onPrimaryContainer = Color.Black,
    secondary = Color.Black,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFF3F4F6),
    onSecondaryContainer = Color.Black,
    tertiary = Color(0xFF1F2937),
    onTertiary = Color.White,
    background = Color.White,
    surface = Color.White,
    surfaceVariant = Color(0xFFE5E7EB),
    onBackground = Color.Black,
    onSurface = Color.Black,
    onSurfaceVariant = Color(0xFF1F2937),
    outline = Color(0xFF9CA3AF),
    outlineVariant = Color(0xFFD1D5DB)
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = WhiteBgBlackTextColorScheme,
        typography = Typography,
        content = content
    )
}
