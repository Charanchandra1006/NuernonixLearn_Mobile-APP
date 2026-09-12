import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Alert, Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from './NueronixCard';
import { NueronixButton } from './NueronixButton';
import { theme, colors } from '../theme/colors';
import { chatbotAPI, mlAPI } from '../services/api';
import * as DocumentPicker from 'expo-document-picker';

interface WeakTopic {
  _id: string;
  topicName: string;
  subject: string;
  completed: boolean;
}

interface Todo {
  _id: string;
  subject: string;
  topicName: string;
  completed: boolean;
}

interface Video {
  videoId?: string;
  title: string;
  channelName?: string;
  url?: string;
}

export const WeakTopicsView = () => {
  const [loading, setLoading] = useState(true);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [nextVideo, setNextVideo] = useState<{ topic: WeakTopic; videos: Video[] } | null>(null);

  const [activeTab, setActiveTab] = useState<'topics' | 'todos'>('topics');

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [topicsRes, todosRes, videoRes] = await Promise.all([
        chatbotAPI.getWeakTopics().catch(() => ({ data: { topics: [] } })),
        chatbotAPI.getTodos().catch(() => ({ data: { todos: [] } })),
        chatbotAPI.getNextVideo().catch(() => ({ data: null })),
      ]);
      setWeakTopics(topicsRes.data.topics || []);
      setTodos(todosRes.data.todos || []);
      setNextVideo(videoRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async () => {
    if (!newSubject || !newTopic) return;
    try {
      await chatbotAPI.addWeakTopic(newTopic, newSubject);
      setAddModal(false);
      setNewSubject('');
      setNewTopic('');
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to add topic');
    }
  };

  const toggleTopic = async (topic: WeakTopic) => {
    try {
      await chatbotAPI.updateWeakTopic(topic._id, !topic.completed);
      setWeakTopics(prev => prev.map(t => t._id === topic._id ? { ...t, completed: !t.completed } : t));
    } catch { }
  };

  const deleteTopic = async (id: string) => {
    try {
      await chatbotAPI.deleteWeakTopic(id);
      setWeakTopics(prev => prev.filter(t => t._id !== id));
    } catch { }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      await chatbotAPI.completeTodo(todo._id);
      setTodos(prev => prev.map(t => t._id === todo._id ? { ...t, completed: true } : t));
    } catch { }
  };

  const handleUploadPDF = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });
      if (res.canceled) return;
      const file = res.assets[0];
      
      setUploadingPdf(true);
      const formData = new FormData() as any;
      formData.append('pdf', {
        uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
        type: 'application/pdf',
        name: file.name
      });
      
      await mlAPI.uploadPDF(formData);
      Alert.alert('Success', 'PDF uploaded successfully! AI will analyze it to find your weak topics.');
      fetchData();
    } catch (e) {
      Alert.alert('Error', 'Failed to upload PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.tabSwitcher}>
          <TouchableOpacity style={[styles.tab, activeTab === 'topics' && styles.tabActive]} onPress={() => setActiveTab('topics')}>
            <Text style={[styles.tabText, activeTab === 'topics' && styles.tabTextActive]}>Weak Topics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'todos' && styles.tabActive]} onPress={() => setActiveTab('todos')}>
            <Text style={[styles.tabText, activeTab === 'todos' && styles.tabTextActive]}>Study Todos</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Ionicons name="add" size={16} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {nextVideo && activeTab === 'topics' && (
          <NueronixCard style={styles.videoCard}>
            <View style={styles.videoHeader}>
              <Ionicons name="play-circle" size={20} color="#e57373" />
              <Text style={styles.videoTitle}>Next Recommended Video</Text>
            </View>
            <Text style={styles.videoSubtitle}>For your weak topic: {nextVideo.topic?.topicName}</Text>
            {nextVideo.videos?.slice(0, 1).map(v => (
              <TouchableOpacity key={v.title} style={styles.videoItem} onPress={() => Linking.openURL(v.url || `https://youtube.com/watch?v=${v.videoId}`)}>
                <Text style={styles.videoItemTitle} numberOfLines={2}>{v.title}</Text>
                <Text style={styles.videoItemSub}>{v.channelName}</Text>
              </TouchableOpacity>
            ))}
          </NueronixCard>
        )}

        {activeTab === 'topics' && (
          <View>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Your Weak Areas</Text>
              <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadPDF} disabled={uploadingPdf}>
                {uploadingPdf ? <ActivityIndicator size="small" color={colors.primary} /> : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={16} color={colors.primary} />
                    <Text style={styles.uploadBtnText}>Upload PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            {weakTopics.length === 0 ? (
              <Text style={styles.emptyText}>No weak topics found. Add one or upload a PDF to extract them automatically.</Text>
            ) : (
              weakTopics.map(t => (
                <View key={t._id} style={styles.row}>
                  <TouchableOpacity style={styles.checkbox} onPress={() => toggleTopic(t)}>
                    <Ionicons name={t.completed ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={t.completed ? colors.primary : theme.border} />
                  </TouchableOpacity>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowTitle, t.completed && styles.rowTitleDone]}>{t.topicName}</Text>
                    <Text style={styles.rowSub}>{t.subject}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteTopic(t._id)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={18} color="#e57373" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'todos' && (
          <View>
            <Text style={styles.sectionTitle}>Your Study Todos</Text>
            {todos.length === 0 ? (
              <Text style={styles.emptyText}>No todos currently. AI generates todos from your weak areas.</Text>
            ) : (
              todos.map(t => (
                <View key={t._id} style={styles.row}>
                  <TouchableOpacity style={styles.checkbox} onPress={() => toggleTodo(t)}>
                    <Ionicons name={t.completed ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={t.completed ? colors.primary : theme.border} />
                  </TouchableOpacity>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowTitle, t.completed && styles.rowTitleDone]}>{t.topicName}</Text>
                    <Text style={styles.rowSub}>{t.subject}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={addModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>Add Weak Topic</Text>
              <TouchableOpacity onPress={() => setAddModal(false)}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Subject (e.g., Mathematics)"
              placeholderTextColor={theme.textSecondary}
              value={newSubject}
              onChangeText={setNewSubject}
            />
            <TextInput
              style={styles.input}
              placeholder="Topic (e.g., Calculus)"
              placeholderTextColor={theme.textSecondary}
              value={newTopic}
              onChangeText={setNewTopic}
            />
            <NueronixButton title="Add Topic" onPress={handleAddTopic} style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  tabSwitcher: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 10, padding: 4, flex: 1, marginRight: 16 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#333' },
  tabText: { fontSize: 13, color: theme.textSecondary, fontWeight: '500' },
  tabTextActive: { color: theme.text, fontWeight: '600' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  uploadBtnText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  emptyText: { color: theme.textSecondary, fontSize: 14, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: theme.surface, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.border },
  checkbox: { marginRight: 12 },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 4 },
  rowTitleDone: { color: theme.textSecondary, textDecorationLine: 'line-through' },
  rowSub: { fontSize: 12, color: theme.textSecondary },
  videoCard: { marginBottom: 24, padding: 16, borderColor: '#e5737333' },
  videoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  videoTitle: { fontSize: 15, fontWeight: '700', color: theme.text },
  videoSubtitle: { fontSize: 13, color: theme.textSecondary, marginBottom: 12 },
  videoItem: { backgroundColor: '#111', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.border },
  videoItemTitle: { fontSize: 14, color: theme.text, fontWeight: '500', marginBottom: 4 },
  videoItemSub: { fontSize: 12, color: theme.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.border },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
  input: { backgroundColor: '#111', borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 14, color: theme.text, fontSize: 15, marginBottom: 12 },
});
