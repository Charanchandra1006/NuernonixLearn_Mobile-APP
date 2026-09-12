import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from '../components/NueronixCard';
import { theme, colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { analyticsAPI, mlAPI, aiAPI } from '../services/api';

const { width } = Dimensions.get('window');

// ─── Mini bar chart ───────────────────────────────────────────────────────────
const BarChart = ({ data, color }: { data: { date: string; minutes: number }[]; color: string }) => {
  const max = Math.max(...data.map(d => d.minutes), 1);
  return (
    <View style={chartStyles.wrapper}>
      {data.map((d, i) => (
        <View key={i} style={chartStyles.barGroup}>
          <View style={chartStyles.barTrack}>
            <View style={[chartStyles.bar, { height: `${(d.minutes / max) * 100}%`, backgroundColor: color }]} />
          </View>
          <Text style={chartStyles.barLabel}>{d.date}</Text>
        </View>
      ))}
    </View>
  );
};
const chartStyles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100 },
  barGroup: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, width: '100%', backgroundColor: '#1a1a1a', borderRadius: 4, justifyContent: 'flex-end' },
  bar: { borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 9, color: '#555', textAlign: 'center' },
});

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }: any) => (
  <NueronixCard style={statStyles.card}>
    <View style={statStyles.iconRow}>
      <View style={[statStyles.iconBox, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Ionicons name="trending-up" size={12} color="#444" />
    </View>
    <Text style={statStyles.value}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
    <View style={[statStyles.topBar, { backgroundColor: color }]} />
  </NueronixCard>
);
const statStyles = StyleSheet.create({
  card: { flex: 1, padding: 14, position: 'relative', overflow: 'hidden' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  iconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconBox: { padding: 6, borderRadius: 8 },
  value: { fontSize: 26, fontWeight: '800', color: theme.text, letterSpacing: -1, lineHeight: 30 },
  label: { fontSize: 11, color: theme.textSecondary, marginTop: 3 },
});

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [dashData, setDashData] = useState<any>(null);
  const [recs, setRecs] = useState<any[]>([]);
  const [dailyProgress, setDailyProgress] = useState<any[]>([]);
  const [aiRec, setAiRec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard().catch(() => ({ data: {} })),
      mlAPI.getRecommendations().catch(() => ({ data: {} })),
      analyticsAPI.getDailyProgress().catch(() => ({ data: {} })),
      aiAPI.getRecommendation().catch(() => ({ data: {} })),
    ]).then(([dash, rec, daily, ai]) => {
      setDashData(dash.data ?? {});
      setRecs(Array.isArray(rec.data?.recommendations) ? rec.data.recommendations : []);
      setDailyProgress(Array.isArray(daily.data?.dailyProgress) ? daily.data.dailyProgress : []);
      setAiRec(ai.data || null);
    }).finally(() => setLoading(false));
  }, []);

  const stats = dashData?.stats || {};
  const recentActivity = Array.isArray(dashData?.recentActivity) ? dashData.recentActivity : [];

  const chartData = dailyProgress.length > 0
    ? dailyProgress.map((d: any) => ({ date: d.date, minutes: Math.round((d.timeSpent || 0) / 60) }))
    : Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en', { weekday: 'short' }),
        minutes: Math.floor(Math.random() * 50 + 10),
      }));

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.greetingSub}>Here is your learning overview</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarBtn}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard icon="school-outline" label="Enrolled" value={stats.enrolledCourses ?? 0} color={colors.primary} />
            <StatCard icon="checkmark-circle-outline" label="Completed" value={stats.completedCourses ?? 0} color="#81c784" />
          </View>
          <View style={styles.statsRow}>
            <StatCard icon="time-outline" label="Hours spent" value={`${Math.floor((stats.totalTimeSpent || 0) / 60)}h`} color="#ffb74d" />
            <StatCard icon="flame-outline" label="Day streak" value={`${stats.currentStreak ?? 0}d`} color="#e57373" />
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <NueronixCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardEyebrow}>ACTIVITY</Text>
              <Text style={styles.cardTitle}>Weekly progress</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>7 days</Text>
            </View>
          </View>
          <BarChart data={chartData} color={colors.primary} />
        </NueronixCard>

        {/* AI Learning Twin */}
        {aiRec && (
          <NueronixCard style={styles.aiCard}>
            <View style={styles.cardHeader}>
              <View style={styles.aiIconRow}>
                <Ionicons name="sparkles" size={16} color="#4DFFA3" />
                <Text style={styles.aiLabel}>AI LEARNING TWIN</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Your Personal Recommendation</Text>
            <View style={styles.aiBox}>
              <Text style={styles.aiText}>
                {aiRec.recommendation || 'Start learning to get personalized recommendations!'}
              </Text>
            </View>
            <View style={styles.chipRow}>
              {[
                `Pace: ${aiRec.learningPace || 'moderate'}`,
                `Level: ${aiRec.experienceLevel || 'beginner'}`,
                `${aiRec.completedTopicsCount || 0} topics done`,
              ].map(c => (
                <View key={c} style={styles.aiChip}>
                  <Text style={styles.aiChipText}>{c}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.aiBtn} onPress={() => navigation.navigate('StudyPlan')}>
              <Text style={styles.aiBtnText}>View Study Plan</Text>
              <Ionicons name="arrow-forward" size={12} color="#4DFFA3" />
            </TouchableOpacity>
          </NueronixCard>
        )}

        {/* AI Recommendations */}
        {recs.length > 0 && (
          <NueronixCard style={styles.card}>
            <Text style={[styles.cardEyebrow, { color: '#ce93d8' }]}>SUGGESTED</Text>
            <Text style={styles.cardTitle}>Recommended Courses</Text>
            {recs.slice(0, 3).map((item: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={[styles.activityRow, i < 2 && styles.activityBorder]}
                onPress={() => navigation.navigate('CourseDetail', { courseId: item.courseId || item._id })}
                activeOpacity={0.8}
              >
                <View style={[styles.activityIcon, { backgroundColor: '#ce93d812' }]}>
                  <Ionicons name="bulb-outline" size={14} color="#ce93d8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityName} numberOfLines={1}>{item.title || item.courseName || 'Course'}</Text>
                  {item.reason && <Text style={{ fontSize: 11, color: theme.textSecondary }} numberOfLines={1}>{item.reason}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={14} color="#555" />
              </TouchableOpacity>
            ))}
          </NueronixCard>
        )}

        {/* Recent Activity */}
        <NueronixCard style={styles.card}>
          <Text style={styles.cardEyebrow}>CONTINUE</Text>
          <Text style={styles.cardTitle}>Recent activity</Text>
          {recentActivity.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={40} color="#333" />
              <Text style={styles.emptyText}>No recent activity</Text>
              <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Courses')}>
                <Text style={styles.exploreBtnText}>Explore courses →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentActivity.slice(0, 4).map((item: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={[styles.activityRow, i < 3 && styles.activityBorder]}
                onPress={() => navigation.navigate('Learn', { courseId: item.courseId })}
                activeOpacity={0.8}
              >
                <View style={styles.activityIcon}>
                  <Ionicons name="school-outline" size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityName} numberOfLines={1}>{item.courseName || 'Course'}</Text>
                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
                    </View>
                    <Text style={styles.progressPct}>{item.progress || 0}%</Text>
                  </View>
                </View>
                <Text style={styles.continueBtn}>Continue →</Text>
              </TouchableOpacity>
            ))
          )}
        </NueronixCard>

        {/* Quick Links */}
        <NueronixCard style={styles.card}>
          <Text style={[styles.cardEyebrow, { color: '#ffb74d' }]}>QUICK LINKS</Text>
          {[
            { label: 'Study Plan', screen: 'StudyPlan', color: '#81c784' },
            { label: 'Exams', screen: 'Exams', color: '#e57373' },
            { label: 'My Diary', screen: 'Diary', color: '#ce93d8' },
            { label: 'My Courses', screen: 'MyCourses', color: '#ffb74d' },
          ].map((link, i) => (
            <TouchableOpacity
              key={link.label}
              style={[styles.quickLink, i < 3 && styles.quickLinkBorder]}
              onPress={() => navigation.navigate(link.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickLinkLabel}>{link.label}</Text>
              <Ionicons name="arrow-forward" size={13} color={link.color} />
            </TouchableOpacity>
          ))}
        </NueronixCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 80 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: theme.text, letterSpacing: -0.5 },
  greetingSub: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  avatarBtn: {},
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${colors.primary}22`,
    borderWidth: 1, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  statsGrid: { gap: 10, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.primary, marginBottom: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text, letterSpacing: -0.3, marginBottom: 12 },
  chip: {
    backgroundColor: `${colors.primary}14`, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: `${colors.primary}33`,
  },
  chipText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  // AI card
  aiCard: { marginBottom: 16, borderColor: 'rgba(77,255,163,0.2)', backgroundColor: 'rgba(0,20,5,0.9)' },
  aiIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: '#4DFFA3' },
  aiBox: {
    padding: 14, borderRadius: 10,
    backgroundColor: 'rgba(77,255,163,0.06)',
    borderWidth: 1, borderColor: 'rgba(77,255,163,0.12)',
    marginBottom: 12,
  },
  aiText: { fontSize: 14, color: theme.text, lineHeight: 21 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  aiChip: {
    backgroundColor: 'rgba(77,255,163,0.12)',
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5,
  },
  aiChipText: { fontSize: 11, color: '#4DFFA3', fontWeight: '600' },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(77,255,163,0.3)',
    borderRadius: 8, paddingVertical: 10,
  },
  aiBtnText: { color: '#4DFFA3', fontSize: 13, fontWeight: '600' },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: theme.textSecondary, marginTop: 8, marginBottom: 16, fontSize: 14 },
  exploreBtn: {},
  exploreBtnText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  // Activity
  activityRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 12,
  },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: theme.border },
  activityIcon: {
    padding: 8, borderRadius: 8,
    backgroundColor: `${colors.primary}12`,
  },
  activityName: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressTrack: { flex: 1, height: 3, backgroundColor: '#222', borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: colors.primary, borderRadius: 2 },
  progressPct: { fontSize: 10, color: theme.textSecondary, minWidth: 28 },
  continueBtn: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  // Quick links
  quickLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 4,
  },
  quickLinkBorder: { borderBottomWidth: 1, borderBottomColor: theme.border },
  quickLinkLabel: { fontSize: 14, fontWeight: '500', color: theme.text },
});
