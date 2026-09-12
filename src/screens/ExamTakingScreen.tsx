import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from '../components/NueronixCard';
import { NueronixButton } from '../components/NueronixButton';
import { theme, colors } from '../theme/colors';
import { examsAPI } from '../services/api';

export const ExamTakingScreen = ({ navigation, route }: any) => {
  const { examId } = route.params;
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    examsAPI.start(examId).then(res => {
      setExamData(res.data);
      setTimeLeft(res.data.timeLimit * 60);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [examId]);

  useEffect(() => {
    if (examData && !showResult && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examData, showResult, timeLeft]);

  const handleSubmit = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      const res = await examsAPI.submit(examId, {
        answers: formattedAnswers,
        timeSpent: (examData.timeLimit * 60) - timeLeft
      });
      setResult(res.data);
      setShowResult(true);
    } catch { /* silent */ }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (showResult && result) {
    const passed = result.result?.passed;
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={[styles.resultIconWrapper, { backgroundColor: passed ? '#4caf50' : '#f44336' }]}>
            <Ionicons name={passed ? 'checkmark' : 'close'} size={60} color="#fff" />
          </View>
          <Text style={styles.resultTitle}>{passed ? 'Congratulations!' : 'Keep Trying!'}</Text>
          <Text style={[styles.resultPct, { color: passed ? '#4caf50' : '#f44336' }]}>{result.result?.percentage}%</Text>
          <Text style={styles.resultScore}>You scored {result.result?.score} out of {result.result?.totalPoints} points</Text>
          
          <View style={styles.actionRow}>
            <NueronixButton title="Back to Exams" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!examData?.questions) return null;

  const question = examData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / examData.questions.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.examTitle}>{examData.examTitle}</Text>
          <View style={[styles.timerBadge, timeLeft < 300 && { borderColor: '#f44336' }]}>
            <Ionicons name="timer-outline" size={16} color={timeLeft < 300 ? '#f44336' : theme.textSecondary} />
            <Text style={[styles.timerText, timeLeft < 300 && { color: '#f44336' }]}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={styles.qHeader}>
            <Text style={styles.qNumber}>Question {currentQuestion + 1} of {examData.questions.length}</Text>
            <Text style={styles.qPoints}>{question.points} points</Text>
          </View>

          <Text style={styles.qText}>{question.text}</Text>

          {question.type === 'multiple_choice' && question.options && (
            <View style={styles.optionsWrap}>
              {question.options.map((opt: string, i: number) => {
                const selected = answers[question.questionId] === opt;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                    onPress={() => setAnswers(prev => ({ ...prev, [question.questionId]: opt }))}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={selected ? '#000' : theme.textSecondary} />
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {question.type === 'short_answer' && (
            <TextInput
              style={styles.saInput}
              placeholder="Type your answer here..."
              placeholderTextColor={theme.textSecondary}
              value={answers[question.questionId] || ''}
              onChangeText={val => setAnswers(prev => ({ ...prev, [question.questionId]: val }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}

          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, currentQuestion === 0 && styles.navBtnDisabled]}
              onPress={() => setCurrentQuestion(p => p - 1)}
              disabled={currentQuestion === 0}
            >
              <Ionicons name="arrow-back" size={16} color={currentQuestion === 0 ? '#555' : theme.text} />
              <Text style={[styles.navBtnText, currentQuestion === 0 && { color: '#555' }]}>Previous</Text>
            </TouchableOpacity>

            {currentQuestion === examData.questions.length - 1 ? (
              <NueronixButton title="Submit Exam" onPress={handleSubmit} style={{ flex: 1, marginLeft: 12 }} />
            ) : (
              <TouchableOpacity style={[styles.navBtn, styles.navBtnNext]} onPress={() => setCurrentQuestion(p => p + 1)}>
                <Text style={[styles.navBtnText, { color: '#000' }]}>Next</Text>
                <Ionicons name="arrow-forward" size={16} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  examTitle: { fontSize: 18, fontWeight: '600', color: theme.text, flex: 1 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: theme.border },
  timerText: { fontSize: 16, fontWeight: '600', color: theme.textSecondary },
  progressTrack: { height: 4, backgroundColor: '#111' },
  progressFill: { height: 4, backgroundColor: colors.primary },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  qNumber: { fontSize: 14, color: theme.textSecondary },
  qPoints: { fontSize: 14, color: theme.textSecondary, fontWeight: '500' },
  qText: { fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 24, lineHeight: 26 },
  optionsWrap: { gap: 12 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 10, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  optionRowSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontSize: 16, color: theme.text, flex: 1 },
  optionTextSelected: { color: '#000', fontWeight: '500' },
  saInput: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 16, color: theme.text, fontSize: 16, minHeight: 120 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.border },
  navBtnNext: { backgroundColor: colors.primary, borderColor: colors.primary, flex: 1, marginLeft: 12, justifyContent: 'center' },
  navBtnDisabled: { borderColor: '#111' },
  navBtnText: { fontSize: 15, fontWeight: '600', color: theme.text },
  // Result
  resultIconWrapper: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  resultTitle: { fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: 16 },
  resultPct: { fontSize: 48, fontWeight: '800', marginBottom: 16 },
  resultScore: { fontSize: 16, color: theme.textSecondary, marginBottom: 32 },
  actionRow: { flexDirection: 'row', gap: 16 },
});
