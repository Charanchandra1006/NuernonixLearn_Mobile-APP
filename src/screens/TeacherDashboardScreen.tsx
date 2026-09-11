import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from '../components/NueronixCard';
import { theme, colors } from '../theme/colors';
import { coursesAPI, authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

export const TeacherDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, averageRating: 0, totalRatings: 0 });

  useEffect(() => {
    Promise.all([
      coursesAPI.get('/courses/teacher'),
      authAPI.get('/auth/me')
    ]).then(([coursesRes, userRes]) => {
      setCourses(coursesRes.data.courses || []);
      const tp = userRes.data.user?.teacherProfile || {};
      setStats({
        totalStudents: tp.totalStudents || 0,
        totalCourses: coursesRes.data.courses?.length || 0,
        averageRating: tp.averageRating || 0,
        totalRatings: tp.totalRatings || 0
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (user?.role !== 'teacher' && user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Ionicons name="lock-closed" size={48} color="#f44336" />
          <Text style={styles.errorText}>Access denied — teachers only.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>Teacher</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.newBtn} activeOpacity={0.8} onPress={() => navigation.navigate('CreateCourse')}>
            <Ionicons name="add" size={16} color="#000" />
            <Text style={styles.newBtnText}>New Course</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Students', value: stats.totalStudents, icon: 'people' },
            { label: 'Courses', value: stats.totalCourses, icon: 'school' },
            { label: 'Avg Rating', value: stats.averageRating.toFixed(1), icon: 'trending-up', sub: 'out of 5' },
            { label: 'Reviews', value: stats.totalRatings, icon: 'bar-chart' },
          ].map((s, i) => (
            <NueronixCard key={i} style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <View style={styles.statIconBox}><Ionicons name={s.icon as any} size={14} color={colors.primary} /></View>
              </View>
              <Text style={styles.statVal}>{s.value}</Text>
              {s.sub && <Text style={styles.statSub}>{s.sub}</Text>}
            </NueronixCard>
          ))}
        </View>

        {/* Courses List */}
        <Text style={styles.sectionTitle}>YOUR COURSES</Text>
        
        {courses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="school-outline" size={48} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>No courses yet</Text>
            <Text style={styles.emptySub}>Create your first course to start teaching.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateCourse')}>
              <Text style={styles.createBtnText}>Create Course</Text>
            </TouchableOpacity>
          </View>
        ) : (
          courses.map(course => (
            <NueronixCard key={course._id} style={styles.courseCard}>
              <View style={styles.cHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.cTags}>
                    <View style={[styles.tag, { backgroundColor: course.isPublished ? '#4caf5022' : '#333' }]}>
                      <Text style={[styles.tagText, { color: course.isPublished ? '#4caf50' : '#aaa' }]}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: course.difficulty === 'beginner' ? '#4caf5022' : course.difficulty === 'intermediate' ? '#ff980022' : '#f4433622' }]}>
                      <Text style={[styles.tagText, { color: course.difficulty === 'beginner' ? '#4caf50' : course.difficulty === 'intermediate' ? '#ff9800' : '#f44336' }]}>
                        {course.difficulty}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cTitle} numberOfLines={2}>{course.title}</Text>
                  <Text style={styles.cSub}>{course.category} • {course.modules?.length || 0} modules</Text>
                </View>
                <TouchableOpacity style={styles.cAction}><Ionicons name="ellipsis-horizontal" size={18} color={theme.textSecondary} /></TouchableOpacity>
              </View>
              
              <View style={styles.cFooter}>
                <View style={styles.cStats}>
                  <View style={styles.cStatItem}>
                    <Ionicons name="people" size={14} color={theme.textSecondary} />
                    <Text style={styles.cStatText}>{course.enrolledCount || 0}</Text>
                  </View>
                  {course.rating > 0 && (
                    <View style={styles.cStatItem}>
                      <Ionicons name="star" size={12} color="#ffb74d" />
                      <Text style={styles.cStatText}>{course.rating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cPrice, course.isFree && { color: '#4caf50' }]}>
                  {course.isFree ? 'Free' : `$${course.price}`}
                </Text>
              </View>
            </NueronixCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 18, color: '#f44336', marginTop: 16, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  subtitle: { fontSize: 12, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '700', color: theme.text, marginTop: 4 },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  newBtnText: { fontSize: 13, fontWeight: '700', color: '#000' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '48%', padding: 16 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  statLabel: { fontSize: 10, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  statIconBox: { backgroundColor: `${colors.primary}15`, padding: 4, borderRadius: 6 },
  statVal: { fontSize: 28, fontWeight: '700', color: theme.text },
  statSub: { fontSize: 11, color: theme.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 12, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  emptyBox: { alignItems: 'center', padding: 40, borderWidth: 1, borderColor: theme.border, borderRadius: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginBottom: 20 },
  createBtn: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  createBtnText: { color: theme.text, fontWeight: '600' },
  courseCard: { padding: 16, marginBottom: 16 },
  cHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cTags: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  cTitle: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 4 },
  cSub: { fontSize: 12, color: theme.textSecondary },
  cAction: { padding: 4 },
  cFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 },
  cStats: { flexDirection: 'row', gap: 12 },
  cStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cStatText: { fontSize: 12, color: theme.textSecondary },
  cPrice: { fontSize: 14, fontWeight: '600', color: theme.text },
});
