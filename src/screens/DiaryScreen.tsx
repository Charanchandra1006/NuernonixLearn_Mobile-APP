import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from '../components/NueronixCard';
import { NueronixButton } from '../components/NueronixButton';
import { theme, colors } from '../theme/colors';
import { diaryAPI } from '../services/api';

const MOODS = [
  { value: 'great', icon: '😁', color: '#10b981' },
  { value: 'good', icon: '🙂', color: '#6366f1' },
  { value: 'okay', icon: '😐', color: '#f59e0b' },
  { value: 'bad', icon: '😕', color: '#ef4444' },
  { value: 'terrible', icon: '😫', color: '#7f1d1d' },
];

export const DiaryScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  
  // Modal states
  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'unlock' | 'create'>('create');
  
  const [entryModal, setEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '', content: '', mood: '', tags: '',
    goalsCompleted: '', goalsMissed: '', nextDayGoals: '', reflections: ''
  });

  useEffect(() => {
    fetchLockStatus();
  }, []);

  useEffect(() => {
    if (!isLocked && !loading) fetchEntries();
  }, [isLocked, loading]);

  const fetchLockStatus = async () => {
    try {
      const res = await diaryAPI.getStatus();
      setHasPassword(res.data.hasPassword);
      setIsLocked(res.data.hasPassword);
    } catch {
      setHasPassword(false); setIsLocked(false);
    } finally { setLoading(false); }
  };

  const fetchEntries = async () => {
    try {
      const res = await diaryAPI.getEntries();
      setEntries(res.data.entries || []);
    } catch { /* silent */ }
  };

  const handleUnlock = async () => {
    setUnlockError('');
    try {
      const res = await diaryAPI.unlock(password);
      if (res.data.unlocked) {
        setIsLocked(false);
        setAuthModal(false);
        setPassword('');
        fetchEntries();
      }
    } catch (err: any) {
      setUnlockError(err.response?.data?.error || 'Invalid password');
    }
  };

  const handleCreatePassword = async () => {
    if (password.length < 4) { setUnlockError('Minimum 4 characters required'); return; }
    try {
      await diaryAPI.lock(password);
      setHasPassword(true);
      setAuthMode('unlock');
      setUnlockError('');
      setPassword('');
      alert('Password created! Enter it now to unlock.');
    } catch (err: any) {
      setUnlockError(err.response?.data?.error || 'Failed to set password');
    }
  };

  const openEntryModal = (entry?: any) => {
    if (entry) {
      setSelectedEntry(entry);
      setFormData({
        title: entry.title || '', content: entry.content || '', mood: entry.mood || '',
        tags: entry.tags?.join(', ') || '',
        goalsCompleted: entry.goalsCompleted?.join(', ') || '',
        goalsMissed: entry.goalsMissed?.join(', ') || '',
        nextDayGoals: entry.nextDayGoals?.join(', ') || '',
        reflections: entry.reflections || ''
      });
    } else {
      setSelectedEntry(null);
      setFormData({ title: '', content: '', mood: '', tags: '', goalsCompleted: '', goalsMissed: '', nextDayGoals: '', reflections: '' });
    }
    setEntryModal(true);
  };

  const saveEntry = async () => {
    try {
      const data = {
        date: new Date(),
        title: formData.title, content: formData.content, mood: formData.mood,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        goalsCompleted: formData.goalsCompleted.split(',').map(t => t.trim()).filter(Boolean),
        goalsMissed: formData.goalsMissed.split(',').map(t => t.trim()).filter(Boolean),
        nextDayGoals: formData.nextDayGoals.split(',').map(t => t.trim()).filter(Boolean),
        reflections: formData.reflections
      };

      if (selectedEntry) await diaryAPI.updateEntry(selectedEntry._id, data);
      else await diaryAPI.createEntry(data);

      setEntryModal(false);
      fetchEntries();
    } catch { /* silent */ }
  };

  const deleteEntry = async (id: string) => {
    try {
      await diaryAPI.deleteEntry(id);
      fetchEntries();
    } catch { /* silent */ }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (isLocked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.lockIconBox}>
            <Ionicons name="lock-closed" size={40} color={colors.primary} />
          </View>
          <Text style={styles.lockTitle}>My Learning Diary</Text>
          <Text style={styles.lockSub}>
            {hasPassword ? 'Enter password to unlock diary' : 'Create password to protect diary'}
          </Text>
          <NueronixButton
            title={hasPassword ? 'Unlock Diary' : 'Set Up Password'}
            onPress={() => {
              setAuthMode(hasPassword ? 'unlock' : 'create');
              setAuthModal(true);
            }}
            style={{ marginTop: 24, width: '100%', maxWidth: 300 }}
          />
        </View>

        {/* Auth Modal */}
        <Modal visible={authModal} transparent animationType="slide" onRequestClose={() => setAuthModal(false)}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{authMode === 'create' ? 'Create Password' : 'Unlock Diary'}</Text>
                <TouchableOpacity onPress={() => setAuthModal(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalDesc}>
                {authMode === 'create' ? 'Password will be required every time you access your diary.' : 'Enter your password to access entries.'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoFocus
              />
              {!!unlockError && <Text style={styles.errorText}>{unlockError}</Text>}
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAuthModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={authMode === 'create' ? handleCreatePassword : handleUnlock}>
                  <Text style={styles.confirmBtnText}>{authMode === 'create' ? 'Save' : 'Unlock'}</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Diary</Text>
          <Text style={styles.subtitle}>Track your learning journey</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => { setIsLocked(true); setEntries([]); setPassword(''); }}>
          <Ionicons name="lock-closed" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.primary, marginLeft: 8 }]} onPress={() => openEntryModal()}>
          <Ionicons name="add" size={18} color="#000" />
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="book-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>No diary entries yet</Text>
          <NueronixButton title="Create First Entry" onPress={() => openEntryModal()} style={{ marginTop: 16 }} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          renderItem={({ item: entry }) => {
            const mood = MOODS.find(m => m.value === entry.mood);
            return (
              <NueronixCard style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Text style={styles.entryDate}>
                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                  </View>
                  {mood && (
                    <View style={[styles.moodBadge, { backgroundColor: `${mood.color}20` }]}>
                      <Text style={styles.moodIcon}>{mood.icon}</Text>
                      <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.value}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.entryContent} numberOfLines={3}>{entry.content}</Text>

                {entry.tags?.length > 0 && (
                  <View style={styles.tagRow}>
                    {entry.tags.map((t: string, i: number) => (
                      <View key={i} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                    ))}
                  </View>
                )}

                <View style={styles.entryActions}>
                  <TouchableOpacity onPress={() => openEntryModal(entry)} style={styles.actionBtn}>
                    <Ionicons name="pencil" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteEntry(entry._id)} style={styles.actionBtn}>
                    <Ionicons name="trash" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </NueronixCard>
            );
          }}
        />
      )}

      {/* Entry Modal */}
      <Modal visible={entryModal} animationType="slide" onRequestClose={() => setEntryModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={styles.entryModalHeader}>
            <Text style={styles.modalTitle}>{selectedEntry ? 'Edit Entry' : 'New Entry'}</Text>
            <TouchableOpacity onPress={() => setEntryModal(false)}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <TextInput style={styles.input} placeholder="Title" placeholderTextColor={theme.textSecondary} value={formData.title} onChangeText={t => setFormData(p => ({ ...p, title: t }))} />
              
              <Text style={styles.fieldLabel}>Mood</Text>
              <View style={styles.moodRow}>
                {MOODS.map(m => (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.moodSelect, formData.mood === m.value && { borderColor: m.color, backgroundColor: `${m.color}10` }]}
                    onPress={() => setFormData(p => ({ ...p, mood: m.value }))}
                  >
                    <Text style={styles.moodSelectIcon}>{m.icon}</Text>
                    <Text style={[styles.moodSelectLabel, formData.mood === m.value && { color: m.color }]}>{m.value}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>What happened today?</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Write your thoughts..." placeholderTextColor={theme.textSecondary} value={formData.content} onChangeText={t => setFormData(p => ({ ...p, content: t }))} multiline numberOfLines={4} textAlignVertical="top" />

              <Text style={styles.fieldLabel}>Tags (comma separated)</Text>
              <TextInput style={styles.input} placeholder="e.g. focused, tired, productive" placeholderTextColor={theme.textSecondary} value={formData.tags} onChangeText={t => setFormData(p => ({ ...p, tags: t }))} />

              <Text style={styles.fieldLabel}>Goals Completed (comma separated)</Text>
              <TextInput style={styles.input} placeholder="e.g. Finish math assignment" placeholderTextColor={theme.textSecondary} value={formData.goalsCompleted} onChangeText={t => setFormData(p => ({ ...p, goalsCompleted: t }))} />

              <Text style={styles.fieldLabel}>Goals Missed (comma separated)</Text>
              <TextInput style={styles.input} placeholder="e.g. Read 10 pages" placeholderTextColor={theme.textSecondary} value={formData.goalsMissed} onChangeText={t => setFormData(p => ({ ...p, goalsMissed: t }))} />

              <NueronixButton title="Save Entry" onPress={saveEntry} style={{ marginTop: 24, marginBottom: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { fontSize: 24, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
  lockIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  lockTitle: { fontSize: 22, fontWeight: '700', color: theme.text, marginBottom: 8 },
  lockSub: { fontSize: 14, color: theme.textSecondary },
  emptyText: { fontSize: 16, color: theme.textSecondary, marginTop: 12 },
  entryCard: { marginBottom: 16, padding: 16 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  entryTitle: { fontSize: 17, fontWeight: '700', color: theme.text, marginBottom: 4 },
  entryDate: { fontSize: 12, color: theme.textSecondary },
  moodBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  moodIcon: { fontSize: 12 },
  moodLabel: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  entryContent: { fontSize: 14, color: theme.textSecondary, lineHeight: 22, marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: theme.border },
  tagText: { fontSize: 11, color: theme.textSecondary },
  entryActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 },
  actionBtn: { padding: 4 },
  // Modal (Auth)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#111', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: theme.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
  modalDesc: { fontSize: 14, color: theme.textSecondary, marginBottom: 20, lineHeight: 20 },
  input: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 14, color: theme.text, fontSize: 15, marginBottom: 16 },
  textArea: { minHeight: 100 },
  errorText: { color: colors.error, fontSize: 13, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: theme.border },
  cancelBtnText: { color: theme.textSecondary, fontWeight: '600', fontSize: 15 },
  confirmBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: colors.primary },
  confirmBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  // Modal (Entry)
  entryModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  moodSelect: { alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.border, flex: 1, marginHorizontal: 2 },
  moodSelectIcon: { fontSize: 20, marginBottom: 4 },
  moodSelectLabel: { fontSize: 10, color: theme.textSecondary, fontWeight: '600', textTransform: 'capitalize' },
});
