import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from '../components/NueronixCard';
import { NueronixButton } from '../components/NueronixButton';
import { theme, colors } from '../theme/colors';
import { adminAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const AdminPanelScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'courses'>('analytics');
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ page: 1, limit: 10 }),
        adminAPI.getCourses({ limit: 10 })
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setCourses(coursesRes.data.courses || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleBlockUser = async (u: any) => {
    try {
      await adminAPI.blockUser(u._id, u.isActive);
      Alert.alert('Success', u.isActive ? 'User blocked' : 'User unblocked');
      loadDashboard();
    } catch { Alert.alert('Error', 'Failed to update user'); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Ionicons name="shield-half" size={48} color="#f44336" />
          <Text style={styles.errorText}>Admin access only.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Full platform control</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadDashboard}>
          <Ionicons name="refresh" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {(['analytics', 'users', 'courses'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <View>
            <View style={styles.statsGrid}>
              {[
                { label: 'Total Users', value: stats?.totalUsers, color: colors.primary, icon: 'people' },
                { label: 'Active (7d)', value: stats?.activeUsersWeek, color: '#81c784', icon: 'trending-up' },
                { label: 'New (7d)', value: stats?.newUsersWeek, color: '#ffb74d', icon: 'person-add' },
                { label: 'Blocked', value: stats?.blockedUsers, color: '#e57373', icon: 'close-circle' },
                { label: 'Students', value: stats?.totalStudents, color: '#4db6ac', icon: 'school' },
                { label: 'Courses', value: stats?.totalCourses, color: '#ce93d8', icon: 'book' },
              ].map((s, i) => (
                <View key={i} style={[styles.statBox, { borderTopColor: s.color }]}>
                  <View style={[styles.statIconBox, { backgroundColor: `${s.color}15` }]}>
                    <Ionicons name={s.icon as any} size={16} color={s.color} />
                  </View>
                  <Text style={styles.statVal}>{s.value || 0}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <View>
            {users.map(u => (
              <NueronixCard key={u._id} style={styles.listCard}>
                <View style={styles.listHeader}>
                  <View style={styles.uAvatar}>
                    <Text style={styles.uAvatarText}>{u.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listTitle}>{u.name}</Text>
                    <Text style={styles.listSub}>{u.email}</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: u.role === 'admin' ? '#e5737322' : u.role === 'teacher' ? '#81c78422' : `${colors.primary}22` }]}>
                    <Text style={[styles.tagText, { color: u.role === 'admin' ? '#e57373' : u.role === 'teacher' ? '#81c784' : colors.primary }]}>{u.role}</Text>
                  </View>
                </View>
                <View style={styles.listFooter}>
                  <View style={[styles.statusDot, { backgroundColor: u.isActive ? '#4caf50' : '#f44336' }]} />
                  <Text style={styles.statusText}>{u.isActive ? 'Active' : 'Blocked'}</Text>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity onPress={() => handleBlockUser(u)} style={styles.actionBtn}>
                    <Text style={[styles.actionBtnText, { color: u.isActive ? '#e57373' : '#4caf50' }]}>
                      {u.isActive ? 'Block' : 'Unblock'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </NueronixCard>
            ))}
          </View>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
          <View>
            {courses.map(c => (
              <NueronixCard key={c._id} style={styles.listCard}>
                <View style={styles.listHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listTitle}>{c.title}</Text>
                    <Text style={styles.listSub}>{c.category} • by {c.teacherId?.name}</Text>
                  </View>
                  {c.featured && (
                    <View style={[styles.tag, { backgroundColor: '#ffb74d22' }]}>
                      <Text style={[styles.tagText, { color: '#ffb74d' }]}>Featured</Text>
                    </View>
                  )}
                </View>
                <View style={styles.listFooter}>
                  <Ionicons name="people" size={14} color={theme.textSecondary} />
                  <Text style={styles.statusText}>{c.enrollments} enrolled</Text>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>Manage</Text>
                  </TouchableOpacity>
                </View>
              </NueronixCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 18, fontWeight: '700', color: '#f44336', marginTop: 16 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 13, color: theme.textSecondary, marginTop: 4 },
  refreshBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
  tabTextActive: { color: colors.primary },
  scrollContent: { padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statBox: { width: '48%', backgroundColor: '#0d0d0d', borderRadius: 10, borderWidth: 1, borderColor: theme.border, padding: 16, borderTopWidth: 3 },
  statIconBox: { alignSelf: 'flex-start', padding: 6, borderRadius: 8, marginBottom: 12 },
  statVal: { fontSize: 24, fontWeight: '800', color: theme.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: theme.textSecondary },
  listCard: { padding: 16, marginBottom: 12 },
  listHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  uAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  uAvatarText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  listTitle: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 4 },
  listSub: { fontSize: 13, color: theme.textSecondary },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  listFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: theme.textSecondary },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: theme.text },
});
