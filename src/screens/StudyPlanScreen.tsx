import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, TextInput, Modal, FlatList, Linking, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from '../components/NueronixCard';
import { NueronixButton } from '../components/NueronixButton';
import { theme, colors } from '../theme/colors';
import { topicsAPI } from '../services/api';
import { WeakTopicsView } from '../components/WeakTopicsView';

const POPULAR_SUBJECTS = [
  'JavaScript', 'Python', 'Machine Learning', 'Data Structures',
  'React', 'Node.js', 'Cyber Security', 'Database Management',
  'DevOps', 'Mobile Development',
];

interface Subject { _id: string; subject: string; }
interface Topic { _id: string; topicTitle: string; order: number; completed: boolean; }
interface Subtopic { _id: string; topicTitle: string; subtopicTitle: string; order: number; completed: boolean; }
interface Resource { title: string; url: string; thumbnail?: string; channelName?: string; description?: string; source?: string; }

export const StudyPlanScreen = ({ navigation }: any) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [resources, setResources] = useState<{ videos: Resource[]; blogs: Resource[] }>({ videos: [], blogs: [] });
  const [pageLoading, setPageLoading] = useState(true);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [subtopicsLoading, setSubtopicsLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  const [addError, setAddError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'topics' | 'subtopics' | 'resources'>('topics');
  const [viewMode, setViewMode] = useState<'roadmap' | 'weak_topics'>('roadmap');

  // Progress
  const doneTopics = topics.filter(t => t.completed).length;
  const topicPct = topics.length > 0 ? Math.round((doneTopics / topics.length) * 100) : 0;

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await topicsAPI.getSubjects();
      const data: Subject[] = res.data.subjects || [];
      setSubjects(data);
      return data;
    } catch { return []; }
  }, []);

  useEffect(() => {
    (async () => {
      const data = await fetchSubjects();
      if (data.length > 0) setSelectedSubject(data[0]);
      setPageLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
    (async () => {
      setRoadmapLoading(true);
      setTopics([]); setSubtopics([]);
      setSelectedTopic(null); setSelectedSubtopic(null);
      setResources({ videos: [], blogs: [] });
      try {
        const res = await topicsAPI.getRoadmap(selectedSubject.subject);
        const t: Topic[] = res.data.topics || [];
        const s: Subtopic[] = res.data.subtopics || [];
        setTopics(t); setSubtopics(s);
        if (t.length > 0) {
          const first = [...t].sort((a, b) => a.order - b.order)[0];
          setSelectedTopic(first);
        }
      } catch { /* silent */ }
      finally { setRoadmapLoading(false); }
    })();
  }, [selectedSubject]);

  const selectTopic = async (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedSubtopic(null);
    setResources({ videos: [], blogs: [] });
    setActiveTab('subtopics');
    setSubtopicsLoading(true);
    try {
      if (!selectedSubject) return;
      const res = await topicsAPI.getSubtopics(selectedSubject.subject, topic.topicTitle);
      const raw: any[] = res.data.subtopics || [];
      const mapped: Subtopic[] = raw.map((s, i) => ({
        _id: s._id || `sub-${i}`,
        topicTitle: topic.topicTitle,
        subtopicTitle: s.title || s.subtopicTitle || s.name || '',
        order: s.order ?? i + 1,
        completed: s.completed || false,
      }));
      setSubtopics(mapped);
      if (mapped.length > 0) {
        const first = [...mapped].sort((a, b) => a.order - b.order)[0];
        setSelectedSubtopic(first);
        fetchResourcesForSubtopic(topic, first);
      } else {
        // fallback to topic resources
        if (selectedSubject) {
          const r = await topicsAPI.getResources(selectedSubject.subject, topic.topicTitle);
          setResources({ videos: r.data.videos || [], blogs: r.data.blogs || [] });
        }
      }
    } catch { /* silent */ }
    finally { setSubtopicsLoading(false); }
  };

  const fetchResourcesForSubtopic = async (topic: Topic, subtopic: Subtopic) => {
    if (!selectedSubject) return;
    setResourcesLoading(true);
    try {
      const res = await topicsAPI.getSubtopicResources(
        selectedSubject.subject, topic.topicTitle, subtopic.subtopicTitle
      );
      setResources({ videos: res.data.videos || [], blogs: res.data.blogs || [] });
    } catch { setResources({ videos: [], blogs: [] }); }
    finally { setResourcesLoading(false); }
  };

  const selectSubtopic = async (sub: Subtopic) => {
    setSelectedSubtopic(sub);
    setActiveTab('resources');
    if (selectedTopic) fetchResourcesForSubtopic(selectedTopic, sub);
  };

  const handleAddSubject = async () => {
    const name = newSubject.trim();
    if (!name) { setAddError('Please enter a subject'); return; }
    setAddingSubject(true); setAddError('');
    try {
      await topicsAPI.addSubject(name);
      const updated = await fetchSubjects();
      const newDoc = updated.find(s => s.subject === name.toLowerCase()) || updated[updated.length - 1];
      setAddModalOpen(false);
      setNewSubject('');
      if (newDoc) setSelectedSubject(newDoc);
    } catch (err: any) {
      setAddError(err.response?.data?.error || 'Failed to add subject');
    } finally { setAddingSubject(false); }
  };

  const handleDeleteSubject = async (id: string) => {
    setDeletingId(id);
    try {
      await topicsAPI.deleteSubject(id);
      const updated = await fetchSubjects();
      if (selectedSubject?._id === id) setSelectedSubject(updated[0] || null);
    } catch { /* silent */ }
    finally { setDeletingId(null); }
  };

  const handleCompleteTopic = async () => {
    if (!selectedSubject || !selectedTopic) return;
    try {
      await topicsAPI.completeTopic(selectedSubject.subject, selectedTopic.topicTitle);
      setTopics(prev => prev.map(t => t.topicTitle === selectedTopic.topicTitle ? { ...t, completed: true } : t));
      setSelectedTopic(prev => prev ? { ...prev, completed: true } : prev);
    } catch { /* silent */ }
  };

  const handleCompleteSubtopic = async () => {
    if (!selectedSubject || !selectedTopic || !selectedSubtopic) return;
    try {
      await topicsAPI.completeSubtopic(selectedSubject.subject, selectedTopic.topicTitle, selectedSubtopic.subtopicTitle);
      setSubtopics(prev => prev.map(s => s.subtopicTitle === selectedSubtopic.subtopicTitle ? { ...s, completed: true } : s));
      setSelectedSubtopic(prev => prev ? { ...prev, completed: true } : prev);
    } catch { /* silent */ }
  };

  if (pageLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.title}>Study Plan</Text>
              <Text style={styles.subtitle}>AI-generated roadmaps</Text>
            </View>
            <View style={styles.modeSwitcher}>
              <TouchableOpacity style={[styles.modeTab, viewMode === 'roadmap' && styles.modeTabActive]} onPress={() => setViewMode('roadmap')}>
                <Text style={[styles.modeTabText, viewMode === 'roadmap' && styles.modeTabTextActive]}>Roadmap</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modeTab, viewMode === 'weak_topics' && styles.modeTabActive]} onPress={() => setViewMode('weak_topics')}>
                <Text style={[styles.modeTabText, viewMode === 'weak_topics' && styles.modeTabTextActive]}>Weak Topics</Text>
              </TouchableOpacity>
            </View>
          </View>
          {viewMode === 'roadmap' && selectedSubject && topics.length > 0 && (
            <View style={[styles.progressRow, { marginTop: 12 }]}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${topicPct}%` }]} />
              </View>
              <Text style={styles.progressPct}>{topicPct}%</Text>
              <Text style={styles.progressLabel}>{doneTopics}/{topics.length} topics</Text>
            </View>
          )}
        </View>
      </View>

      {viewMode === 'weak_topics' ? (
        <WeakTopicsView />
      ) : (
        <>
          {/* Subject tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}>
        {subjects.map(sub => (
          <View key={sub._id} style={styles.subjectTabWrap}>
            <TouchableOpacity
              style={[styles.subjectTab, selectedSubject?._id === sub._id && styles.subjectTabActive]}
              onPress={() => setSelectedSubject(sub)}
              activeOpacity={0.8}
            >
              <Text style={[styles.subjectTabText, selectedSubject?._id === sub._id && styles.subjectTabTextActive]}>
                {sub.subject}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => Alert.alert('Delete', `Remove "${sub.subject}"?`, [
                { text: 'Cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => handleDeleteSubject(sub._id) }
              ])}
              activeOpacity={0.7}
            >
              {deletingId === sub._id
                ? <ActivityIndicator size="small" color="#e57373" />
                : <Ionicons name="close" size={12} color="#555" />
              }
            </TouchableOpacity>
          </View>
        ))}
        {subjects.length === 0 && (
          <TouchableOpacity style={styles.emptySubjectBtn} onPress={() => setAddModalOpen(true)}>
            <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.emptySubjectText}>Add your first subject</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Mobile tabs: Topics | Subtopics | Resources */}
      <View style={styles.tabBar}>
        {(['topics', 'subtopics', 'resources'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {/* TOPICS TAB */}
        {activeTab === 'topics' && (
          <View>
            {roadmapLoading ? (
              <View style={styles.center}><ActivityIndicator color="#81c784" /><Text style={styles.loadingText}>Building roadmap…</Text></View>
            ) : topics.length === 0 ? (
              <View style={styles.center}>
                <Ionicons name="school-outline" size={48} color="#222" />
                <Text style={styles.emptyText}>Select a subject to see topics</Text>
              </View>
            ) : (
              <>
                {/* Progress bar */}
                <View style={[styles.progressTrack, { marginBottom: 16 }]}>
                  <View style={[styles.progressFill, { width: `${topicPct}%`, backgroundColor: '#81c784' }]} />
                </View>
                {[...topics].sort((a, b) => a.order - b.order).map((topic, idx) => (
                  <TouchableOpacity
                    key={topic._id}
                    style={[styles.topicRow, selectedTopic?.topicTitle === topic.topicTitle && styles.topicRowActive]}
                    onPress={() => selectTopic(topic)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={topic.completed ? 'checkmark-circle' : 'radio-button-off'}
                      size={16} color={topic.completed ? '#4caf50' : '#333'}
                    />
                    <Text style={[styles.topicText, selectedTopic?.topicTitle === topic.topicTitle && styles.topicTextActive]}>
                      {idx + 1}. {topic.topicTitle}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color="#444" />
                  </TouchableOpacity>
                ))}
                {selectedTopic && !selectedTopic.completed && (
                  <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteTopic} activeOpacity={0.8}>
                    <Ionicons name="checkmark-done" size={14} color="#81c784" />
                    <Text style={styles.completeBtnText}>Mark topic complete</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* SUBTOPICS TAB */}
        {activeTab === 'subtopics' && (
          <View>
            {!selectedTopic ? (
              <View style={styles.center}><Text style={styles.emptyText}>Select a topic first</Text></View>
            ) : subtopicsLoading ? (
              <View style={styles.center}><ActivityIndicator color="#ffb74d" /></View>
            ) : subtopics.length === 0 ? (
              <View style={styles.center}>
                <Ionicons name="information-circle-outline" size={32} color="#ffb74d" />
                <Text style={styles.emptyText}>No subtopics — resources shown in Resources tab</Text>
              </View>
            ) : (
              <>
                {subtopics.map((sub, i) => (
                  <TouchableOpacity
                    key={sub._id}
                    style={[styles.topicRow, selectedSubtopic?.subtopicTitle === sub.subtopicTitle && styles.subtopicRowActive]}
                    onPress={() => selectSubtopic(sub)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={sub.completed ? 'checkmark-circle' : 'radio-button-off'}
                      size={16} color={sub.completed ? '#4caf50' : '#333'}
                    />
                    <Text style={[styles.topicText, selectedSubtopic?.subtopicTitle === sub.subtopicTitle && { color: '#ffb74d', fontWeight: '600' }]}>
                      {i + 1}. {sub.subtopicTitle}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color="#444" />
                  </TouchableOpacity>
                ))}
                {selectedSubtopic && !selectedSubtopic.completed && (
                  <TouchableOpacity style={[styles.completeBtn, { borderColor: '#ffb74d44' }]} onPress={handleCompleteSubtopic} activeOpacity={0.8}>
                    <Ionicons name="checkmark-done" size={14} color="#ffb74d" />
                    <Text style={[styles.completeBtnText, { color: '#ffb74d' }]}>Mark subtopic complete</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* RESOURCES TAB */}
        {activeTab === 'resources' && (
          <View>
            {resourcesLoading ? (
              <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
            ) : (
              <>
                {/* Videos */}
                {resources.videos.length > 0 && (
                  <>
                    <View style={styles.resHeader}>
                      <Ionicons name="play-circle-outline" size={16} color="#e57373" />
                      <Text style={styles.resTitle}>Videos</Text>
                      <Text style={styles.resCount}>{resources.videos.length}</Text>
                    </View>
                    {resources.videos.map((v, i) => (
                      <TouchableOpacity key={i} style={styles.resourceCard} onPress={() => Linking.openURL(v.url)} activeOpacity={0.8}>
                        <View style={styles.resIcon}>
                          <Ionicons name="logo-youtube" size={20} color="#e57373" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.resName} numberOfLines={2}>{v.title}</Text>
                          {v.channelName && <Text style={styles.resSub}>{v.channelName}</Text>}
                        </View>
                        <Ionicons name="open-outline" size={14} color="#555" />
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {/* Blogs */}
                {resources.blogs.length > 0 && (
                  <>
                    <View style={[styles.resHeader, { marginTop: 16 }]}>
                      <Ionicons name="document-text-outline" size={16} color="#64b5f6" />
                      <Text style={styles.resTitle}>Articles</Text>
                      <Text style={styles.resCount}>{resources.blogs.length}</Text>
                    </View>
                    {resources.blogs.map((b, i) => (
                      <TouchableOpacity key={i} style={styles.resourceCard} onPress={() => Linking.openURL(b.url)} activeOpacity={0.8}>
                        <View style={[styles.resIcon, { backgroundColor: '#64b5f618' }]}>
                          <Ionicons name="reader-outline" size={18} color="#64b5f6" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.resName} numberOfLines={2}>{b.title}</Text>
                          {b.source && <Text style={styles.resSub}>{b.source}</Text>}
                        </View>
                        <Ionicons name="open-outline" size={14} color="#555" />
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {resources.videos.length === 0 && resources.blogs.length === 0 && !resourcesLoading && (
                  <View style={styles.center}>
                    <Ionicons name="library-outline" size={48} color="#222" />
                    <Text style={styles.emptyText}>Select a subtopic to load resources</Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Subject Modal */}
      <Modal visible={addModalOpen} animationType="slide" transparent onRequestClose={() => setAddModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Subject</Text>
              <TouchableOpacity onPress={() => { setAddModalOpen(false); setNewSubject(''); setAddError(''); }}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Python, Calculus, Cyber Security..."
              placeholderTextColor={theme.textSecondary}
              value={newSubject}
              onChangeText={setNewSubject}
              autoFocus
            />

            {!!addError && <Text style={styles.addError}>{addError}</Text>}

            <Text style={styles.popularLabel}>Popular subjects:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
              {POPULAR_SUBJECTS.map(s => (
                <TouchableOpacity key={s} style={[styles.popularChip, newSubject === s && styles.popularChipActive]} onPress={() => setNewSubject(s)} activeOpacity={0.8}>
                  <Text style={[styles.popularChipText, newSubject === s && styles.popularChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAddModalOpen(false); setNewSubject(''); setAddError(''); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddSubject} disabled={addingSubject} activeOpacity={0.8}>
                {addingSubject ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.confirmBtnText}>Add Subject</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  title: { fontSize: 24, fontWeight: '700', color: theme.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  modeSwitcher: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 8, padding: 3 },
  modeTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  modeTabActive: { backgroundColor: '#333' },
  modeTabText: { fontSize: 11, color: theme.textSecondary, fontWeight: '500' },
  modeTabTextActive: { color: theme.text, fontWeight: '700' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 3, backgroundColor: '#1a1a1a', borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: colors.primary, borderRadius: 2 },
  progressPct: { fontSize: 11, color: colors.primary, fontWeight: '700' },
  progressLabel: { fontSize: 11, color: theme.textSecondary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  addBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  subjectScroll: { maxHeight: 52 },
  subjectTabWrap: { flexDirection: 'row', alignItems: 'center' },
  subjectTab: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: theme.border,
    backgroundColor: 'transparent',
  },
  subjectTabActive: { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
  subjectTabText: { fontSize: 13, color: theme.textSecondary, fontWeight: '500', textTransform: 'capitalize' },
  subjectTabTextActive: { color: colors.primary, fontWeight: '700' },
  deleteBtn: { marginLeft: 4, padding: 4 },
  emptySubjectBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 },
  emptySubjectText: { fontSize: 13, color: colors.primary },
  tabBar: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 13, color: theme.textSecondary, fontWeight: '500' },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
  loadingText: { color: theme.textSecondary, marginTop: 8, fontSize: 13 },
  emptyText: { color: theme.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' },
  topicRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 10, marginBottom: 4,
  },
  topicRowActive: { backgroundColor: 'rgba(46,125,50,0.1)' },
  subtopicRowActive: { backgroundColor: 'rgba(255,183,77,0.08)' },
  topicText: { flex: 1, fontSize: 14, color: '#aaa', fontWeight: '400' },
  topicTextActive: { color: '#fff', fontWeight: '600' },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: '#81c78444', borderRadius: 8,
    paddingVertical: 10, marginTop: 12,
  },
  completeBtnText: { color: '#81c784', fontSize: 13, fontWeight: '600' },
  resHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  resTitle: { fontSize: 15, fontWeight: '700', color: theme.text },
  resCount: {
    backgroundColor: '#1a1a1a', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
    fontSize: 11, color: theme.textSecondary,
  },
  resourceCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: theme.surface, borderRadius: 10,
    borderWidth: 1, borderColor: theme.border, marginBottom: 8,
  },
  resIcon: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#e5737318',
    alignItems: 'center', justifyContent: 'center',
  },
  resName: { fontSize: 13, color: theme.text, fontWeight: '500', lineHeight: 18 },
  resSub: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
  modalInput: {
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, padding: 14, color: theme.text, fontSize: 15, marginBottom: 8,
  },
  addError: { color: colors.error, fontSize: 13, marginBottom: 8 },
  popularLabel: { fontSize: 13, color: theme.textSecondary, marginBottom: 8, fontWeight: '500' },
  popularChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 8, borderWidth: 1, borderColor: theme.border,
  },
  popularChipActive: { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
  popularChipText: { fontSize: 13, color: theme.textSecondary },
  popularChipTextActive: { color: colors.primary, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    borderWidth: 1, borderColor: theme.border, borderRadius: 10,
  },
  cancelBtnText: { color: theme.textSecondary, fontWeight: '600', fontSize: 15 },
  confirmBtn: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    backgroundColor: colors.primary, borderRadius: 10,
  },
  confirmBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
