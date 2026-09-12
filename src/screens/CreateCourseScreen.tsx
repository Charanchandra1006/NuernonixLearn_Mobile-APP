import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, TextInput, Switch, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, colors } from '../theme/colors';
import { coursesAPI } from '../services/api';

export const CreateCourseScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", shortDescription: "", category: "Programming",
    difficulty: "beginner", price: "0", isFree: true,
    tags: "", whatYouWillLearn: [""], requirements: [""], modules: [] as any[]
  });

  const [moduleModal, setModuleModal] = useState(false);
  const [editModule, setEditModule] = useState<any>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const [selectModal, setSelectModal] = useState<'category' | 'difficulty' | null>(null);

  const CATEGORIES = ['Programming', 'Data Science', 'Web Development', 'Machine Learning', 'Mathematics', 'Science'];
  const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

  const handleChange = (field: string, value: any) => setFormData(p => ({ ...p, [field]: value }));

  const handleArrayChange = (field: 'whatYouWillLearn' | 'requirements', idx: number, val: string) => {
    const arr = [...formData[field]];
    arr[idx] = val;
    setFormData(p => ({ ...p, [field]: arr }));
  };

  const addArrayItem = (field: 'whatYouWillLearn' | 'requirements') => {
    setFormData(p => ({ ...p, [field]: [...p[field], ""] }));
  };

  const removeArrayItem = (field: 'whatYouWillLearn' | 'requirements', idx: number) => {
    const arr = [...formData[field]];
    arr.splice(idx, 1);
    setFormData(p => ({ ...p, [field]: arr.length ? arr : [""] }));
  };

  const openModuleDialog = (mod?: any, idx?: number) => {
    if (mod) setEditModule({ ...mod, order: idx });
    else setEditModule({ title: "", content: "", type: "video", duration: "10", videoUrl: "", order: formData.modules.length });
    setModuleModal(true);
  };

  const saveModule = () => {
    if (!editModule?.title) return;
    setFormData(p => {
      const arr = [...p.modules];
      const exist = arr.findIndex(m => m.order === editModule.order);
      if (exist >= 0) arr[exist] = editModule;
      else arr.push(editModule);
      return { ...p, modules: arr };
    });
    setModuleModal(false);
    setEditModule(null);
  };

  const handleSubmit = async (publish: boolean) => {
    if (!formData.title || !formData.description) return alert("Fill required fields");
    setLoading(true);
    try {
      await coursesAPI.create({
        ...formData,
        price: Number(formData.price) || 0,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        whatYouWillLearn: formData.whatYouWillLearn.filter(Boolean),
        requirements: formData.requirements.filter(Boolean),
        isPublished: publish
      });
      navigation.goBack();
    } catch (err: any) { alert(err.response?.data?.error || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Course</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>

        <TextInput style={styles.input} placeholder="Course Title *" placeholderTextColor={theme.textSecondary} value={formData.title} onChangeText={v => handleChange('title', v)} />
        <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} placeholder="Full Description *" placeholderTextColor={theme.textSecondary} multiline value={formData.description} onChangeText={v => handleChange('description', v)} />
        
        <View style={styles.row}>
          <TouchableOpacity style={[styles.input, { flex: 1, marginRight: 8, justifyContent: 'center' }]} onPress={() => setSelectModal('category')}>
            <Text style={{ color: formData.category ? theme.text : theme.textSecondary }}>{formData.category || 'Category *'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.input, { flex: 1, justifyContent: 'center' }]} onPress={() => setSelectModal('difficulty')}>
            <Text style={{ color: formData.difficulty ? theme.text : theme.textSecondary, textTransform: 'capitalize' }}>{formData.difficulty || 'Difficulty *'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.switchRow}>
            <Switch value={formData.isFree} onValueChange={v => handleChange('isFree', v)} thumbColor={formData.isFree ? colors.primary : '#f4f3f4'} trackColor={{ false: '#3e3e3e', true: `${colors.primary}55` }} />
            <Text style={styles.switchText}>Free Course</Text>
          </View>
          {!formData.isFree && (
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Price" keyboardType="numeric" value={formData.price} onChangeText={v => handleChange('price', v)} placeholderTextColor={theme.textSecondary} />
          )}
        </View>

        <TextInput style={styles.input} placeholder="Tags (comma separated)" placeholderTextColor={theme.textSecondary} value={formData.tags} onChangeText={v => handleChange('tags', v)} />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>WHAT STUDENTS WILL LEARN</Text>
        {formData.whatYouWillLearn.map((item, i) => (
          <View key={i} style={styles.arrayRow}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="e.g. Build projects" placeholderTextColor={theme.textSecondary} value={item} onChangeText={v => handleArrayChange('whatYouWillLearn', i, v)} />
            <TouchableOpacity onPress={() => removeArrayItem('whatYouWillLearn', i)} style={styles.delBtn}><Ionicons name="trash" size={20} color="#f44336" /></TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={() => addArrayItem('whatYouWillLearn')}><Ionicons name="add" size={16} color={colors.primary} /><Text style={styles.addBtnText}>Add outcome</Text></TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>MODULES</Text>
        {formData.modules.map((m, i) => (
          <TouchableOpacity key={i} style={styles.modCard} onPress={() => setExpandedModule(expandedModule === i ? null : i)}>
            <View style={styles.modHeader}>
              <Text style={styles.modIndex}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.modTitle}>{m.title}</Text>
                <Text style={styles.modSub}>{m.type} • {m.duration} min</Text>
              </View>
              <Ionicons name={expandedModule === i ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
            </View>
            {expandedModule === i && (
              <View style={styles.modBody}>
                <Text style={styles.modContent}>{m.content || 'No content'}</Text>
                <View style={styles.modActions}>
                  <TouchableOpacity onPress={() => openModuleDialog(m, m.order)}><Text style={{ color: colors.primary }}>Edit</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setFormData(p => ({ ...p, modules: p.modules.filter(x => x.order !== m.order) }))}><Text style={{ color: '#f44336' }}>Delete</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={() => openModuleDialog()}><Ionicons name="add" size={16} color={colors.primary} /><Text style={styles.addBtnText}>Add Module</Text></TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.draftBtn} onPress={() => handleSubmit(false)} disabled={loading}><Text style={styles.draftText}>Save Draft</Text></TouchableOpacity>
          <TouchableOpacity style={styles.pubBtn} onPress={() => handleSubmit(true)} disabled={loading}><Text style={styles.pubText}>{loading ? 'Saving...' : 'Publish'}</Text></TouchableOpacity>
        </View>

      </ScrollView>

      {/* Module Modal */}
      <Modal visible={moduleModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editModule?.title ? 'Edit Module' : 'New Module'}</Text>
            <TextInput style={styles.input} placeholder="Module Title" placeholderTextColor={theme.textSecondary} value={editModule?.title} onChangeText={v => setEditModule((p: any) => ({ ...p, title: v }))} />
            
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Type (video/text/quiz)" placeholderTextColor={theme.textSecondary} value={editModule?.type} onChangeText={v => setEditModule((p: any) => ({ ...p, type: v }))} />
              <TextInput style={[styles.input, { width: 100 }]} placeholder="Mins" keyboardType="numeric" placeholderTextColor={theme.textSecondary} value={String(editModule?.duration || '')} onChangeText={v => setEditModule((p: any) => ({ ...p, duration: v }))} />
            </View>

            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Content / Notes" placeholderTextColor={theme.textSecondary} multiline value={editModule?.content} onChangeText={v => setEditModule((p: any) => ({ ...p, content: v }))} />
            
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModuleModal(false)} style={styles.modalBtn}><Text style={{ color: theme.textSecondary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveModule} style={styles.modalBtn}><Text style={{ color: colors.primary, fontWeight: '700' }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Select Picker Modal */}
      <Modal visible={!!selectModal} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalBg} onPress={() => setSelectModal(null)} activeOpacity={1}>
          <View style={[styles.modalContent, { maxHeight: '60%' }]}>
            <Text style={styles.modalTitle}>Select {selectModal === 'category' ? 'Category' : 'Difficulty'}</Text>
            <ScrollView>
              {(selectModal === 'category' ? CATEGORIES : DIFFICULTIES).map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.selectOption}
                  onPress={() => {
                    handleChange(selectModal as string, opt);
                    setSelectModal(null);
                  }}
                >
                  <Text style={[styles.selectOptionText, formData[selectModal as string] === opt && { color: colors.primary, fontWeight: '700' }]}>
                    {opt}
                  </Text>
                  {formData[selectModal as string] === opt && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 12, color: theme.textSecondary, letterSpacing: 1, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 14, color: theme.text, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  switchText: { color: theme.text, marginLeft: 8 },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 24 },
  arrayRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  delBtn: { padding: 12 },
  addBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4 },
  addBtnText: { color: colors.primary, fontWeight: '600' },
  modCard: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 8, marginBottom: 8, overflow: 'hidden' },
  modHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  modIndex: { fontSize: 14, fontWeight: '700', color: theme.textSecondary, width: 24 },
  modTitle: { fontSize: 15, fontWeight: '600', color: theme.text },
  modSub: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  modBody: { padding: 12, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: '#000' },
  modContent: { fontSize: 13, color: theme.textSecondary, marginBottom: 12 },
  modActions: { flexDirection: 'row', gap: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 32, gap: 12 },
  draftBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.border },
  draftText: { color: theme.text },
  pubBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.primary },
  pubText: { color: '#000', fontWeight: '700' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: theme.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: theme.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 8 },
  modalBtn: { padding: 8 },
  selectOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  selectOptionText: { fontSize: 15, color: theme.text, textTransform: 'capitalize' },
});
