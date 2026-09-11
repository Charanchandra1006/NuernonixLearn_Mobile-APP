import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

interface ExamTimerProps {
  durationSeconds: number;
  onTimeUp?: () => void;
}

export const ExamTimer = ({ durationSeconds, onTimeUp }: ExamTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isWarning = timeLeft <= 60; // Less than 1 minute

  return (
    <View style={[styles.container, isWarning && styles.warningContainer]}>
      <Ionicons 
        name="time-outline" 
        size={18} 
        color={isWarning ? '#f44336' : theme.textSecondary} 
      />
      <Text style={[styles.timeText, isWarning && styles.warningText]}>
        {formatTime(timeLeft)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  warningContainer: {
    borderColor: '#f44336',
    backgroundColor: '#330000',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    fontVariant: ['tabular-nums'],
  },
  warningText: {
    color: '#f44336',
  },
});
