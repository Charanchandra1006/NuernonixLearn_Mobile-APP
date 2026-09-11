import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from '../components/NueronixCard';
import { theme, colors } from '../theme/colors';
import api, { examsAPI } from '../services/api';

export const TeacherExamsListScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams?status=all');
      setExams(res.data.exams || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handlePublish = async (id: string) => {
    try {
      await examsAPI.publish(id);
      fetchExams();
      Alert.alert('Success', 'Exam published');
    } catch { Alert.alert('Error', 'Failed to publish exam'); }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Exam', 'Are you sure you want to delete this exam?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/exams/${id}`);
            fetchExams();
          } catch { Alert.alert('Error', 'Failed to delete'); }
        }
      }
    ]);
  };

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Exams</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateExam')}>
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {exams.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="school-outline" size={48} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>No exams yet</Text>
            <Text style={styles.emptySub}>Create your first exam to test your students</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateExam')}>
              <Text style={styles.createBtnText}>Create Exam</Text>
            </TouchableOpacity>
          </View>
        ) : (
          exams.map(exam => (
            <NueronixCard key={exam._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cTitle}>{exam.title}</Text>
                  <Text style={styles.cDesc} numberOfLines={1}>{exam.description || 'No description'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(exam._id)} style={{ padding: 4 }}>
                  <Ionicons name="trash" size={18} color="#f44336" />
                </TouchableOpacity>
              </View>

              <View style={styles.tagsRow}>
                <View style={[styles.tag, { backgroundColor: exam.status === 'published' ? '#4caf5022' : '#333' }]}>
                  <Text style={[styles.tagText, { color: exam.status === 'published' ? '#4caf50' : '#aaa' }]}>{exam.status}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#ff980022' }]}>
                  <Text style={[styles.tagText, { color: '#ff9800' }]}>{exam.difficulty}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: `${colors.primary}22` }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{exam.questions?.length || 0} Qs</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.statsText}>{exam.totalAttempts || 0} attempts • Avg {exam.averageScore?.toFixed(1) || 0}%</Text>
                {exam.status !== 'published' && (
                  <TouchableOpacity style={styles.pubBtn} onPress={() => handlePublish(exam._id)}>
                    <Text style={styles.pubText}>Publish</Text>
                  </TouchableOpacity>
                )}
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
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  backBtn: { marginRight: 16 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: theme.text },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16 },
  emptyBox: { alignItems: 'center', padding: 40, borderWidth: 1, borderColor: theme.border, borderRadius: 12, marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginBottom: 20 },
  createBtn: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  createBtnText: { color: theme.text, fontWeight: '600' },
  card: { padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  cTitle: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 4 },
  cDesc: { fontSize: 13, color: theme.textSecondary },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 },
  statsText: { fontSize: 12, color: theme.textSecondary },
  pubBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  pubText: { fontSize: 12, fontWeight: '600', color: '#000' }
});
