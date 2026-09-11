import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixButton } from '../components/NueronixButton';
import { NueronixCard } from '../components/NueronixCard';
import { theme, colors } from '../theme/colors';
import { learningAPI } from '../services/api';

export const LearnScreen = ({ navigation, route }: any) => {
  const { courseId } = route.params;
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const loadModule = async () => {
    setLoading(true);
    setResult(null);
    setAnswer('');
    startTimeRef.current = Date.now();
    try {
      const res = await learningAPI.getNextModule(courseId);
      if (res.data.completed) {
        setModule({ completed: true });
      } else {
        setModule(res.data.module);
        setProgress(res.data.progress);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { loadModule(); }, [courseId]);

  const handleComplete = async () => {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      await learningAPI.updateProgress({ courseId, moduleId: module._id, completed: true, timeSpent });
    } catch { /* silent */ }
    loadModule();
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await learningAPI.submitAnswer({
        courseId,
        assessmentId: module.assessments?.[0]?._id || 'demo',
        questionId: module.assessments?.[0]?.questions?.[0]?._id || 'demo',
        answer,
      });
      setResult(res.data);
    } catch {
      setResult({ correct: false, feedback: 'Keep learning! Try again.' });
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (module?.completed) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.completedContainer}>
          <View style={styles.completedIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#4caf50" />
          </View>
          <Text style={styles.completedTitle}>Course Completed! 🎉</Text>
          <Text style={styles.completedSub}>Congratulations on completing this course!</Text>
          <NueronixButton title="Back to Dashboard" onPress={() => navigation.navigate('Dashboard')} style={{ marginTop: 32 }} />
        </View>
      </SafeAreaView>
    );
  }

  const pct = progress?.percentage || 0;
  const isQuiz = module?.type === 'quiz';
  const isVideo = module?.type === 'video';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{module?.title}</Text>
          <Text style={styles.headerSub}>{progress?.completed || 0}/{progress?.total || 0} completed</Text>
        </View>
        <View style={[styles.typeBadge, isQuiz && styles.typeBadgeQuiz, isVideo && styles.typeBadgeVideo]}>
          <Text style={[styles.typeBadgeText, isQuiz && { color: '#ce93d8' }, isVideo && { color: '#64b5f6' }]}>
            {module?.type || 'lesson'}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Module content */}
          <NueronixCard style={styles.moduleCard}>
            {isVideo && module?.videoUrl && (
              <View style={styles.videoPlaceholder}>
                <Ionicons name="play-circle" size={48} color={colors.primary} />
                <Text style={styles.videoNote}>Video content — open in browser for best experience</Text>
              </View>
            )}
            <Text style={styles.content}>{module?.content}</Text>
          </NueronixCard>

          {/* Quiz section */}
          {isQuiz && (
            <NueronixCard style={styles.quizCard}>
              <Text style={styles.quizTitle}>Test Your Knowledge</Text>
              {module?.assessments?.[0]?.questions?.[0]?.text && (
                <Text style={styles.question}>{module.assessments[0].questions[0].text}</Text>
              )}
              <TextInput
                style={styles.answerInput}
                placeholder="Type your answer here..."
                placeholderTextColor={theme.textSecondary}
                value={answer}
                onChangeText={setAnswer}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <NueronixButton
                title="Submit Answer"
                onPress={handleSubmitAnswer}
                loading={submitting}
                disabled={!answer.trim()}
                style={{ marginTop: 12 }}
              />

              {result && (
                <View style={[styles.resultBox, result.correct ? styles.resultCorrect : styles.resultWrong]}>
                  <View style={styles.resultHeader}>
                    <Ionicons
                      name={result.correct ? 'checkmark-circle' : 'information-circle'}
                      size={20}
                      color={result.correct ? '#4caf50' : '#64b5f6'}
                    />
                    <Text style={[styles.resultTitle, { color: result.correct ? '#4caf50' : '#64b5f6' }]}>
                      {result.correct ? 'Correct!' : 'Keep Learning!'}
                    </Text>
                  </View>
                  {(result.feedback || result.explanation) && (
                    <Text style={styles.resultFeedback}>{result.feedback || result.explanation}</Text>
                  )}
                </View>
              )}
            </NueronixCard>
          )}

          {/* Next module button */}
          <NueronixButton
            title="Continue to Next Module →"
            onPress={handleComplete}
            style={{ marginTop: 8, marginBottom: 80 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  completedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  completedIcon: { marginBottom: 16 },
  completedTitle: { fontSize: 28, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 8 },
  completedSub: { fontSize: 15, color: theme.textSecondary, textAlign: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  headerSub: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  typeBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    backgroundColor: `${colors.primary}15`, borderWidth: 1, borderColor: `${colors.primary}44`,
  },
  typeBadgeQuiz: { backgroundColor: '#ce93d815', borderColor: '#ce93d844' },
  typeBadgeVideo: { backgroundColor: '#64b5f615', borderColor: '#64b5f644' },
  typeBadgeText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  progressTrack: { height: 4, backgroundColor: '#111' },
  progressFill: { height: 4, backgroundColor: colors.primary },
  container: { padding: 16 },
  moduleCard: { marginBottom: 16 },
  videoPlaceholder: {
    height: 160, backgroundColor: '#111',
    borderRadius: 8, marginBottom: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.border,
  },
  videoNote: { fontSize: 12, color: theme.textSecondary, marginTop: 8 },
  content: { fontSize: 15, color: theme.textSecondary, lineHeight: 24 },
  quizCard: { marginBottom: 16, borderColor: '#ce93d844' },
  quizTitle: { fontSize: 17, fontWeight: '700', color: theme.text, marginBottom: 12 },
  question: { fontSize: 15, color: theme.text, lineHeight: 22, marginBottom: 12 },
  answerInput: {
    backgroundColor: '#0d0d0d',
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, padding: 14,
    color: theme.text, fontSize: 15, minHeight: 100,
  },
  resultBox: {
    marginTop: 16, padding: 14, borderRadius: 10, borderWidth: 1,
  },
  resultCorrect: { backgroundColor: '#4caf5012', borderColor: '#4caf5033' },
  resultWrong: { backgroundColor: '#64b5f612', borderColor: '#64b5f633' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  resultTitle: { fontSize: 15, fontWeight: '700' },
  resultFeedback: { fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
});
