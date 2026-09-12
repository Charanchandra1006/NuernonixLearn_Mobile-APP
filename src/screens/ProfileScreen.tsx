import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from '../components/NueronixCard';
import { NueronixButton } from '../components/NueronixButton';
import { theme, colors } from '../theme/colors';
import { authAPI, analyticsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const ProfileScreen = () => {
  const { user, updateUser } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({ name });
      if (user) updateUser({ ...user, name });
      Alert.alert('Success', 'Profile saved successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const roleColor: Record<string, string> = {
    student: colors.primary, teacher: '#81c784', admin: '#e57373',
  };

  const rc = roleColor[user?.role || 'student'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account details</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          {/* Avatar & Identity */}
          <NueronixCard style={styles.idCard}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { borderColor: `${rc}44` }]}>
                <Text style={[styles.avatarText, { color: rc }]}>{user?.name?.charAt(0).toUpperCase()}</Text>
              </View>
              {/* Note: React Native Expo image picker would be used here for avatar upload, omitted for simplicity */}
            </View>
            <Text style={styles.nameText}>{user?.name}</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: `${rc}18`, borderColor: `${rc}44` }]}>
              <Text style={[styles.roleText, { color: rc }]}>{user?.role}</Text>
            </View>
          </NueronixCard>

          {/* Stats */}
          <NueronixCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart" size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>LEARNING STATISTICS</Text>
            </View>
            {statsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <View style={styles.statsGrid}>
                {[
                  { label: 'Enrolled courses', value: stats?.enrolledCourses ?? 0 },
                  { label: 'Completed', value: stats?.completedCourses ?? 0 },
                  { label: 'Time spent', value: `${Math.floor((stats?.totalTimeSpent || 0) / 60)}h` },
                  { label: 'Streak', value: `${stats?.currentStreak ?? 0}d` },
                ].map(s => (
                  <View key={s.label} style={styles.statBox}>
                    <Text style={styles.statVal}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </NueronixCard>

          {/* Settings */}
          <NueronixCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={18} color="#81c784" />
              <Text style={[styles.sectionTitle, { color: '#81c784' }]}>ACCOUNT SETTINGS</Text>
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Display name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={theme.textSecondary} />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={user?.email} editable={false} />
            </View>

            <NueronixButton title="Save Changes" onPress={handleSave} loading={saving} style={{ marginTop: 12 }} />
          </NueronixCard>

          {/* Learning Preferences */}
          {user?.profile && (
            <NueronixCard style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={18} color="#ffb74d" />
                <Text style={[styles.sectionTitle, { color: '#ffb74d' }]}>LEARNING PREFERENCES</Text>
              </View>

              <View style={styles.prefsGrid}>
                {[
                  { label: 'Learning style', value: user.profile.preferredLearningStyle },
                  { label: 'Pace', value: user.profile.pacePreference },
                  { label: 'Level', value: user.profile.currentPerformanceLevel },
                ].filter(i => i.value).map(item => (
                  <View key={item.label} style={styles.prefBox}>
                    <Text style={styles.prefLabel}>{item.label}</Text>
                    <Text style={styles.prefVal}>{item.value?.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>

              {user.profile.subjectInterests?.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.tagsTitle}>Subject interests</Text>
                  <View style={styles.tagsRow}>
                    {user.profile.subjectInterests.map((s: string) => (
                      <View key={s} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
                    ))}
                  </View>
                </View>
              )}

              {user.profile.weakAreas?.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.tagsTitle}>Focus areas (weak topics)</Text>
                  <View style={styles.tagsRow}>
                    {user.profile.weakAreas.map((s: string) => (
                      <View key={s} style={[styles.tag, styles.tagWeak]}><Text style={[styles.tagText, { color: '#ffb74d' }]}>{s}</Text></View>
                    ))}
                  </View>
                </View>
              )}
            </NueronixCard>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { fontSize: 24, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 13, color: theme.textSecondary, marginTop: 4 },
  idCard: { alignItems: 'center', padding: 24, marginBottom: 16 },
  avatarWrap: { marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1a1a1a', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 40, fontWeight: '700' },
  nameText: { fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 4 },
  emailText: { fontSize: 14, color: theme.textSecondary, marginBottom: 12 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  roleText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  sectionCard: { padding: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statBox: { width: '48%', backgroundColor: '#0d0d0d', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: theme.border, alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: theme.textSecondary },
  inputWrap: { marginBottom: 16 },
  inputLabel: { fontSize: 13, color: theme.textSecondary, marginBottom: 8 },
  input: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 14, color: theme.text, fontSize: 15 },
  inputDisabled: { backgroundColor: '#0a0a0a', color: '#555' },
  prefsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  prefBox: { flex: 1, minWidth: '30%', backgroundColor: '#0d0d0d', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.border },
  prefLabel: { fontSize: 11, color: theme.textSecondary, marginBottom: 4 },
  prefVal: { fontSize: 13, color: theme.text, fontWeight: '600', textTransform: 'capitalize' },
  tagsTitle: { fontSize: 12, color: theme.textSecondary, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: `${colors.primary}15`, borderWidth: 1, borderColor: `${colors.primary}33` },
  tagWeak: { backgroundColor: '#ffb74d15', borderColor: '#ffb74d33' },
  tagText: { fontSize: 11, color: colors.primary },
});
