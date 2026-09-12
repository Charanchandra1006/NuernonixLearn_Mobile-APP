import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, colors } from '../theme/colors';
import { examsAPI } from '../services/api';

export const CreateExamScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", category: "Programming", difficulty: "medium",
    timeLimit: "30", passingScore: "70", maxAttempts: "3", questions: [] as any[]
  });
  const [selectModal, setSelectModal] = useState<'category' | 'difficulty' | null>(null);

  const CATEGORIES = ['Programming', 'Data Science', 'Web Development', 'Machine Learning', 'Mathematics', 'Science'];
  const DIFFICULTIES = ['easy', 'medium', 'hard'];

  const handleChange = (field: string, value: any) => setFormData(p => ({ ...p, [field]: value }));

  const addQuestion = () => {
    setFormData(p => ({
      ...p,
      questions: [...p.questions, { text: '', type: 'multiple_choice', options: ['', '', '', ''], correctAnswer: '', points: '1', difficulty: 'medium' }]
    }));
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    const arr = [...formData.questions];
    arr[idx][field] = value;
    setFormData(p => ({ ...p, questions: arr }));
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const arr = [...formData.questions];
    if (!arr[qIdx].options) arr[qIdx].options = ['', '', '', ''];
    arr[qIdx].options[oIdx] = val;
    setFormData(p => ({ ...p, questions: arr }));
  };

  const removeQuestion = (idx: number) => {
    const arr = [...formData.questions];
    arr.splice(idx, 1);
    setFormData(p => ({ ...p, questions: arr }));
  };

  const handleSubmit = async () => {
    if (!formData.title) return alert("Title is required");
    if (formData.questions.length === 0) return alert("Add at least one question");

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.text || !q.correctAnswer) return alert(`Question ${i + 1} is missing text or answer`);
    }

    setLoading(true);
    try {
      await examsAPI.create({
        title: formData.title, description: formData.description,
        category: formData.category, difficulty: formData.difficulty,
        settings: { timeLimit: Number(formData.timeLimit), passingScore: Number(formData.passingScore), maxAttempts: Number(formData.maxAttempts) },
        questions: formData.questions.map(q => ({
          text: q.text, type: q.type,
          options: q.type === 'multiple_choice' ? q.options.filter(Boolean) : undefined,
          correctAnswer: q.correctAnswer, points: Number(q.points), difficulty: q.difficulty
        }))
      });
      navigation.goBack();
    } catch (err: any) { alert(err.response?.data?.error || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Exam</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>
          <TextInput style={styles.input} placeholder="Exam Title *" placeholderTextColor={theme.textSecondary} value={formData.title} onChangeText={v => handleChange('title', v)} />
          <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Description" multiline placeholderTextColor={theme.textSecondary} value={formData.description} onChangeText={v => handleChange('description', v)} />
          
          <View style={styles.row}>
            <TouchableOpacity style={[styles.input, { flex: 1, marginRight: 12, justifyContent: 'center' }]} onPress={() => setSelectModal('category')}>
              <Text style={{ color: formData.category ? theme.text : theme.textSecondary }}>{formData.category || 'Category *'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.input, { flex: 1, justifyContent: 'center' }]} onPress={() => setSelectModal('difficulty')}>
              <Text style={{ color: formData.difficulty ? theme.text : theme.textSecondary, textTransform: 'capitalize' }}>{formData.difficulty || 'Difficulty *'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Time Limit (min)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={formData.timeLimit} onChangeText={v => handleChange('timeLimit', v)} placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Passing %</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={formData.passingScore} onChangeText={v => handleChange('passingScore', v)} placeholderTextColor={theme.textSecondary} />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Attempts</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={formData.maxAttempts} onChangeText={v => handleChange('maxAttempts', v)} placeholderTextColor={theme.textSecondary} />
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>QUESTIONS</Text>
          {formData.questions.map((q, i) => (
            <View key={i} style={styles.qCard}>
              <View style={styles.qHeader}>
                <Text style={styles.qIndex}>Q{String(i + 1).padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => removeQuestion(i)} style={{ padding: 4 }}>
                  <Ionicons name="trash" size={16} color="#f44336" />
                </TouchableOpacity>
              </View>

              <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} placeholder="Question Text *" multiline placeholderTextColor={theme.textSecondary} value={q.text} onChangeText={v => updateQuestion(i, 'text', v)} />
              
              <View style={styles.row2}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Type (multiple_choice/short_answer)" placeholderTextColor={theme.textSecondary} value={q.type} onChangeText={v => updateQuestion(i, 'type', v)} />
                <TextInput style={[styles.input, { width: 80 }]} placeholder="Points" keyboardType="numeric" placeholderTextColor={theme.textSecondary} value={String(q.points)} onChangeText={v => updateQuestion(i, 'points', v)} />
              </View>

              {q.type === 'multiple_choice' && (
                <View style={styles.optionsWrap}>
                  {q.options.map((opt: string, oIdx: number) => (
                    <View key={oIdx} style={styles.optRow}>
                      <Text style={styles.optLetter}>{String.fromCharCode(65 + oIdx)}</Text>
                      <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder={`Option ${oIdx + 1}`} placeholderTextColor={theme.textSecondary} value={opt} onChangeText={v => updateOption(i, oIdx, v)} />
                    </View>
                  ))}
                  <TextInput style={styles.input} placeholder="Exact Correct Answer" placeholderTextColor={theme.textSecondary} value={q.correctAnswer} onChangeText={v => updateQuestion(i, 'correctAnswer', v)} />
                </View>
              )}

              {q.type === 'short_answer' && (
                <TextInput style={styles.input} placeholder="Expected Answer" placeholderTextColor={theme.textSecondary} value={q.correctAnswer} onChangeText={v => updateQuestion(i, 'correctAnswer', v)} />
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addQuestion}><Ionicons name="add" size={16} color={colors.primary} /><Text style={styles.addBtnText}>Add Question</Text></TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.pubBtn} onPress={handleSubmit} disabled={loading}><Text style={styles.pubText}>{loading ? 'Creating...' : 'Create Exam'}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  input: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, color: theme.text, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  row2: { flexDirection: 'row', gap: 12 },
  inputWrap: { flex: 1 },
  inputLabel: { fontSize: 11, color: theme.textSecondary, marginBottom: 4 },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 24 },
  qCard: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 16, marginBottom: 16 },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  qIndex: { fontSize: 13, fontWeight: '700', color: theme.text, backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  optionsWrap: { backgroundColor: '#000', padding: 12, borderRadius: 8, marginTop: 4 },
  optRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  optLetter: { fontSize: 14, fontWeight: '700', color: theme.textSecondary, width: 24 },
  addBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4 },
  addBtnText: { color: colors.primary, fontWeight: '600' },
  actions: { marginTop: 32, alignItems: 'flex-end' },
  pubBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, backgroundColor: colors.primary },
  pubText: { color: '#000', fontWeight: '700' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: theme.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: theme.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 },
  selectOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  selectOptionText: { fontSize: 15, color: theme.text, textTransform: 'capitalize' },
});
