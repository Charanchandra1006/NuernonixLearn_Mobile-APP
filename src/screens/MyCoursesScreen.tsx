import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from '../components/NueronixCard';
import { NueronixButton } from '../components/NueronixButton';
import { theme, colors } from '../theme/colors';
import { coursesAPI } from '../services/api';

export const MyCoursesScreen = ({ navigation }: any) => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesAPI.getMyCourses()
      .then(res => setEnrollments(res.data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
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
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Courses</Text>
          <Text style={styles.subtitle}>{enrollments.length} enrolled</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {enrollments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="school-outline" size={48} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>No courses yet</Text>
            <Text style={styles.emptySub}>Browse the catalogue and enroll in your first course.</Text>
            <NueronixButton title="Browse Courses" onPress={() => navigation.navigate('Courses')} style={{ marginTop: 16 }} />
          </View>
        ) : (
          enrollments.map((enr, i) => {
            const course = enr.course;
            if (!course) return null;
            const modulesTotal = course.modules?.length || 0;
            const modulesCompleted = enr.progress || 0;
            const pct = modulesTotal > 0 ? Math.round((modulesCompleted / modulesTotal) * 100) : 0;
            const completed = enr.completed;

            return (
              <NueronixCard key={course._id || i} style={styles.card}>
                <View style={[styles.progressTopBar, { width: `${Math.max(pct, 5)}%`, backgroundColor: completed ? '#4caf50' : colors.primary }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.tag, { backgroundColor: course.difficulty === 'beginner' ? '#4caf5022' : course.difficulty === 'intermediate' ? '#ff980022' : '#f4433622' }]}>
                      <Text style={[styles.tagText, { color: course.difficulty === 'beginner' ? '#4caf50' : course.difficulty === 'intermediate' ? '#ff9800' : '#f44336' }]}>
                        {course.difficulty}
                      </Text>
                    </View>
                    {completed && <Ionicons name="checkmark-circle" size={18} color="#4caf50" />}
                  </View>

                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>

                  <View style={styles.progressArea}>
                    <View style={styles.progressRow}>
                      <Text style={styles.progressLabel}>PROGRESS</Text>
                      <Text style={[styles.progressPct, completed && { color: '#4caf50' }]}>{pct}%</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: completed ? '#4caf50' : colors.primary }]} />
                    </View>
                    <Text style={styles.progressSub}>{modulesCompleted} / {modulesTotal} modules</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={[styles.actionBtn, completed && styles.actionBtnOutlined]}
                    onPress={() => navigation.navigate('Learn', { courseId: course._id })}
                  >
                    <Ionicons name="play" size={14} color={completed ? theme.text : '#000'} />
                    <Text style={[styles.actionBtnText, completed && { color: theme.text }]}>
                      {completed ? 'Review' : 'Continue'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </NueronixCard>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { fontSize: 24, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 13, color: theme.textSecondary, marginTop: 4 },
  scrollContent: { padding: 16 },
  emptyBox: { alignItems: 'center', padding: 40, borderWidth: 1, borderColor: theme.border, borderRadius: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginBottom: 20 },
  card: { marginBottom: 16, overflow: 'hidden' },
  progressTopBar: { height: 4 },
  cardBody: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  courseTitle: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 8 },
  courseDesc: { fontSize: 13, color: theme.textSecondary, lineHeight: 20, marginBottom: 16 },
  progressArea: { marginBottom: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 10, color: theme.textSecondary, fontWeight: '700', letterSpacing: 1 },
  progressPct: { fontSize: 11, color: theme.text, fontWeight: '700' },
  progressTrack: { height: 4, backgroundColor: '#1a1a1a', borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  progressSub: { fontSize: 11, color: theme.textSecondary, marginTop: 6 },
  cardFooter: { borderTopWidth: 1, borderTopColor: theme.border, padding: 12, alignItems: 'flex-end' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  actionBtnOutlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#000' },
});
