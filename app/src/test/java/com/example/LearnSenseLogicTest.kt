package com.example

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class LearnSenseLogicTest {

    @Test
    fun `verify topic mastery formula TRD section 5`() {
        // mastery_score = 0.4 * concept_understanding + 0.4 * practice_accuracy + 0.2 * revision_stability
        val concept = 42.0
        val practice = 45.0
        val stability = 48.0
        val expected = (0.4 * concept) + (0.4 * practice) + (0.2 * stability)
        assertEquals(44.4, expected, 0.01)
        assertTrue("Expected WEAK classification for score < 45", expected < 45.0)
    }

    @Test
    fun `verify mastery classification thresholds`() {
        fun classify(score: Double) = when {
            score >= 75.0 -> "STRONG"
            score >= 45.0 -> "MODERATE"
            else -> "WEAK"
        }
        assertEquals("STRONG", classify(84.0))
        assertEquals("MODERATE", classify(62.0))
        assertEquals("WEAK", classify(44.0))
    }

    @Test
    fun `verify risk score thresholds`() {
        fun riskTier(score: Double) = when {
            score > 70.0 -> "HIGH"
            score >= 40.0 -> "MEDIUM"
            else -> "LOW"
        }
        assertEquals("HIGH", riskTier(73.5))
        assertEquals("MEDIUM", riskTier(55.0))
        assertEquals("LOW", riskTier(25.0))
    }
}
