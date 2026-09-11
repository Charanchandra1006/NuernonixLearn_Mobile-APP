import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from '../components/NueronixCard';
import { theme, colors } from '../theme/colors';
import { diaryAPI } from '../services/api';

const MOODS = [
  { value: 'great', icon: '😁', color: '#10b981' },
  { value: 'good', icon: '🙂', color: '#6366f1' },
  { value: 'okay', icon: '😐', color: '#f59e0b' },
  { value: 'bad', icon: '😕', color: '#ef4444' },
  { value: 'terrible', icon: '😫', color: '#7f1d1d' },
];

export const ExamsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    diaryAPI.get('/exams').then(res => {
      setExams(res.data.exams || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Exams</Text>
        <Text style={styles.subtitle}>Test your knowledge and track progress</Text>
      </View>

      {exams.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="trophy-outline" size={64} color="#333" />
          <Text style={styles.emptyText}>No exams available</Text>
          <Text style={styles.emptySub}>Check back later for new exams</Text>
        </View>
      ) : (
        <FlatList
          data={exams}
          contentContainerStyle={{ padding: 16 }}
          keyExtractor={(item) => item._id}
          renderItem={({ item: exam }) => (
            <NueronixCard style={styles.examCard}>
              <View style={styles.examHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.examTitle}>{exam.title}</Text>
                  <Text style={styles.examDesc} numberOfLines={2}>{exam.description || 'No description'}</Text>
                </View>
                <View style={styles.timerBadge}>
                  <Ionicons name="timer-outline" size={14} color={theme.textSecondary} />
                  <Text style={styles.timerText}>{exam.settings?.timeLimit || 60} min</Text>
                </View>
              </View>

              <View style={styles.tagRow}>
                <View style={[styles.tag, { borderColor: exam.difficulty === 'easy' ? '#4caf50' : exam.difficulty === 'hard' ? '#f44336' : '#ff9800' }]}>
                  <Text style={[styles.tagText, { color: exam.difficulty === 'easy' ? '#4caf50' : exam.difficulty === 'hard' ? '#f44336' : '#ff9800' }]}>
                    {exam.difficulty || 'Medium'}
                  </Text>
                </View>
                <View style={styles.tag}><Text style={styles.tagText}>{exam.category}</Text></View>
                <View style={styles.tag}><Text style={styles.tagText}>{exam.questions?.length || 0} Qs</Text></View>
              </View>

              <View style={styles.examFooter}>
                <Text style={styles.passingScore}>Passing Score: {exam.settings?.passingScore || 70}%</Text>
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => navigation.navigate('ExamTaking', { examId: exam._id })}
                >
                  <Text style={styles.startBtnText}>Start Exam</Text>
                </TouchableOpacity>
              </View>
            </NueronixCard>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { fontSize: 24, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
  emptyText: { fontSize: 18, color: theme.textSecondary, marginTop: 16 },
  emptySub: { fontSize: 14, color: theme.textSecondary, marginTop: 8 },
  examCard: { marginBottom: 16, padding: 16 },
  examHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  examTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 4 },
  examDesc: { fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  timerText: { fontSize: 12, color: theme.textSecondary, fontWeight: '500' },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: theme.border },
  tagText: { fontSize: 12, color: theme.textSecondary, fontWeight: '500', textTransform: 'capitalize' },
  examFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 16 },
  passingScore: { fontSize: 13, color: theme.textSecondary },
  startBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  startBtnText: { color: '#000', fontWeight: '600', fontSize: 14 },
});
