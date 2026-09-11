import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Platform, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixButton } from '../components/NueronixButton';
import { NueronixTextField } from '../components/NueronixTextField';
import { theme, colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';

const STEPS = ['Grade', 'Subjects', 'Weak Areas', 'Goals', 'Preferences'];

const GRADES = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'College 1st Year', 'College 2nd Year', 'College 3rd Year', 'College 4th Year', 'Post Graduate'];

const SUBJECTS = [
  'Computer Science', 'Cyber Security', 'Web Development',
  'Artificial Intelligence', 'Machine Learning', 'Data Science',
  'Mobile Development', 'Mathematics', 'Physics', 'Chemistry',
  'Biology', 'English', 'History', 'Geography', 'Economics', 'Business Studies',
];

const GOALS = [
  { value: 'board_exams', label: '📋 Board Exams' },
  { value: 'jee', label: '🎯 JEE' },
  { value: 'neet', label: '⚕️ NEET' },
  { value: 'certification', label: '🏆 Certification' },
  { value: 'skill_improvement', label: '🚀 Skill Improvement' },
  { value: 'knowledge_exploration', label: '🔍 Knowledge Exploration' },
  { value: 'career', label: '💼 Career' },
];

const STYLES = [
  { value: 'video', label: '🎥 Video' },
  { value: 'text', label: '📖 Text' },
  { value: 'practice', label: '✏️ Practice' },
  { value: 'interactive', label: '💡 Interactive' },
  { value: 'mixed', label: '🔀 Mixed' },
];

export const OnboardingScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(0);
  const [grade, setGrade] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState('mixed');
  const [pace, setPace] = useState('medium');
  const [performance, setPerformance] = useState('average');
  const [loading, setLoading] = useState(false);
  const { completeOnboarding } = useAuthStore();

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        grade,
        subjectInterests: subjects,
        weakAreas,
        learningGoals: goals,
        preferredLearningStyle: learningStyle,
        pacePreference: pace,
        currentPerformanceLevel: performance,
      });
      navigation.replace('StudentApp');
    } catch {
      navigation.replace('StudentApp');
    } finally {
      setLoading(false);
    }
  };

  const ChipGrid = ({ items, selected, onToggle }: { items: string[] | { value: string; label: string }[]; selected: string[]; onToggle: (v: string) => void }) => (
    <View style={styles.chipGrid}>
      {items.map((item) => {
        const val = typeof item === 'string' ? item : item.value;
        const label = typeof item === 'string' ? item : item.label;
        const active = selected.includes(val);
        return (
          <TouchableOpacity
            key={val}
            onPress={() => onToggle(val)}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const SegBtn = ({ value, current, onPress, label }: any) => (
    <TouchableOpacity
      style={[styles.segment, current === value && styles.segmentActive]}
      onPress={() => onPress(value)}
      activeOpacity={0.8}
    >
      <Text style={[styles.segmentText, current === value && styles.segmentTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.stepTitle}>What grade are you in?</Text>
            <View style={styles.chipGrid}>
              {GRADES.map(g => (
                <TouchableOpacity
                  key={g} onPress={() => setGrade(g)}
                  style={[styles.chip, grade === g && styles.chipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, grade === g && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>What subjects interest you?</Text>
            <ChipGrid items={SUBJECTS} selected={subjects} onToggle={v => toggle(subjects, v, setSubjects)} />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Which are your weak areas?</Text>
            <Text style={styles.stepHint}>These will be prioritised in your study plan</Text>
            <ChipGrid items={SUBJECTS} selected={weakAreas} onToggle={v => toggle(weakAreas, v, setWeakAreas)} />
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>What are your learning goals?</Text>
            <ChipGrid items={GOALS} selected={goals} onToggle={v => toggle(goals, v, setGoals)} />
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.stepTitle}>Your learning preferences</Text>

            <Text style={styles.fieldLabel}>Preferred Learning Style:</Text>
            <View style={styles.segRow}>
              {STYLES.map(s => <SegBtn key={s.value} value={s.value} current={learningStyle} onPress={setLearningStyle} label={s.label} />)}
            </View>

            <Text style={styles.fieldLabel}>Learning Pace:</Text>
            <View style={styles.segRow}>
              {['slow', 'medium', 'fast'].map(p => <SegBtn key={p} value={p} current={pace} onPress={setPace} label={p.charAt(0).toUpperCase() + p.slice(1)} />)}
            </View>

            <Text style={styles.fieldLabel}>Performance Level:</Text>
            <View style={styles.segRow}>
              {['below_average', 'average', 'above_average', 'excellent'].map(p => (
                <SegBtn key={p} value={p} current={performance} onPress={setPerformance}
                  label={p.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} />
              ))}
            </View>
          </>
        );
    }
  };

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>N</Text>
          </View>
          <Text style={styles.stepIndicator}>Step {step + 1} of {STEPS.length}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Step tabs */}
        <View style={styles.stepTabs}>
          {STEPS.map((s, i) => (
            <View key={s} style={[styles.stepTab, i <= step && styles.stepTabActive]}>
              <Text style={[styles.stepTabText, i <= step && styles.stepTabTextActive]}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Step content */}
        <View style={styles.stepContent}>
          {renderStep()}
        </View>

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
              <Ionicons name="arrow-back" size={16} color={theme.textSecondary} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(s => s + 1)}>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} disabled={loading}>
              <Text style={styles.nextBtnText}>{loading ? 'Setting up...' : 'Finish'}</Text>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  logoBox: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { color: '#fff', fontWeight: '800', fontSize: 18 },
  stepIndicator: { fontSize: 13, color: theme.textSecondary, fontWeight: '600' },
  progressTrack: {
    height: 3, backgroundColor: '#1a1a1a',
    borderRadius: 2, marginBottom: 16,
  },
  progressFill: {
    height: 3, backgroundColor: colors.primary, borderRadius: 2,
  },
  stepTabs: { flexDirection: 'row', gap: 6, marginBottom: 32, flexWrap: 'wrap' },
  stepTab: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, backgroundColor: '#111',
    borderWidth: 1, borderColor: '#1a1a1a',
  },
  stepTabActive: { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
  stepTabText: { fontSize: 11, color: theme.textSecondary, fontWeight: '500' },
  stepTabTextActive: { color: colors.primary, fontWeight: '600' },
  stepContent: { flex: 1, marginBottom: 32 },
  stepTitle: { fontSize: 22, fontWeight: '700', color: theme.text, marginBottom: 8 },
  stepHint: { fontSize: 13, color: theme.textSecondary, marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: theme.textSecondary, marginBottom: 8, marginTop: 16 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: theme.border,
  },
  chipActive: { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
  chipText: { fontSize: 13, color: theme.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  segRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  segment: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 10, borderWidth: 1, borderColor: theme.border,
  },
  segmentActive: { backgroundColor: `${colors.primary}22`, borderColor: colors.primary },
  segmentText: { fontSize: 13, color: theme.textSecondary, fontWeight: '500' },
  segmentTextActive: { color: colors.primary, fontWeight: '600' },
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1a1a1a',
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  backBtnText: { color: theme.textSecondary, fontWeight: '600', fontSize: 15 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 24,
  },
  finishBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 24,
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
