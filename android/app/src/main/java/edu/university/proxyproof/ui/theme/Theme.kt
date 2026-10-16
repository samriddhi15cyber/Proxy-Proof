package edu.university.proxyproof.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = BurgundyPrimary,
    onPrimary = CreamSurface,
    primaryContainer = PaleBurgundy,
    onPrimaryContainer = BurgundyPrimary,
    secondary = AntiqueGold,
    onSecondary = CharcoalText,
    secondaryContainer = ParchmentBackground,
    onSecondaryContainer = CharcoalText,
    tertiary = MutedGreen,
    onTertiary = CreamSurface,
    background = ParchmentBackground,
    onBackground = CharcoalText,
    surface = CreamSurface,
    onSurface = CharcoalText,
    surfaceVariant = ParchmentBackground,
    onSurfaceVariant = SecondaryText,
    outline = SubtleBorder,
    outlineVariant = SubtleBorder
)

@Composable
fun ProxyProofTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = LightColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = ParchmentBackground.toArgb()
            window.navigationBarColor = CreamSurface.toArgb()
            val windowInsetsController = WindowCompat.getInsetsController(window, view)
            windowInsetsController.isAppearanceLightStatusBars = true
            windowInsetsController.isAppearanceLightNavigationBars = true
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
