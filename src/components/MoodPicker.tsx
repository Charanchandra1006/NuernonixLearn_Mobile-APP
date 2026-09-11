import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/colors';

const MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '🤔', label: 'Focused', value: 'focused' },
  { emoji: '😫', label: 'Stressed', value: 'stressed' },
  { emoji: '😴', label: 'Tired', value: 'tired' }
];

interface MoodPickerProps {
  selectedMood?: string;
  onSelectMood: (moodValue: string) => void;
}

export const MoodPicker = ({ selectedMood, onSelectMood }: MoodPickerProps) => {
  return (
    <View style={styles.container}>
      {MOODS.map((mood) => {
        const isSelected = selectedMood === mood.value;
        return (
          <TouchableOpacity
            key={mood.value}
            style={[styles.moodBtn, isSelected && styles.moodBtnSelected]}
            onPress={() => onSelectMood(mood.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.emoji, isSelected && styles.emojiSelected]}>
              {mood.emoji}
            </Text>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  moodBtn: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    width: '18%',
  },
  moodBtnSelected: {
    backgroundColor: '#1a1a1a',
    borderColor: theme.border,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  emojiSelected: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 10,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  labelSelected: {
    color: theme.text,
    fontWeight: '700',
  },
});
