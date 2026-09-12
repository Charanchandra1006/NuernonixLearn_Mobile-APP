import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixTextField } from '../components/NueronixTextField';
import { NueronixButton } from '../components/NueronixButton';
import { theme, colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';

const SUBJECTS = [
  'Computer Science', 'Cyber Security', 'Web Development',
  'Artificial Intelligence', 'Machine Learning', 'Data Science',
  'Mobile Development', 'Cloud Computing', 'DevOps', 'Blockchain',
  'Quantum Computing', 'Mathematics', 'Physics', 'Chemistry',
  'Biology', 'Economics', 'Business Studies', 'English', 'History', 'Geography',
];

type Role = 'student' | 'teacher';
type Pace = 'slow' | 'moderate' | 'fast';
type Level = 'beginner' | 'intermediate' | 'professional';

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('student');
  const [learningPace, setLearningPace] = useState<Pace>('moderate');
  const [experienceLevel, setExperienceLevel] = useState<Level>('beginner');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { setError('Please fill all required fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role, phone, learningPace, experienceLevel, selectedSubjects);
      const { user } = useAuthStore.getState();
      if (role === 'teacher') navigation.replace('TeacherApp');
      else navigation.replace('Onboarding');
    } catch (err: any) {
      console.error('Registration Catch Error:', err.message, err.response?.data);
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SegmentBtn = ({ value, current, onPress, label }: any) => (
    <TouchableOpacity
      style={[styles.segment, current === value && styles.segmentActive]}
      onPress={() => onPress(value)}
      activeOpacity={0.8}
    >
      <Text style={[styles.segmentText, current === value && styles.segmentTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>N</Text>
            </View>
            <Text style={styles.brandName}>NeuronixLearn</Text>
          </View>

          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>Start learning today</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#D32F2F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <NueronixTextField
            label="Full name"
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <NueronixTextField
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <NueronixTextField
            label="Phone (optional)"
            placeholder="+91 234 567 8900"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Ionicons name="phone-portrait-outline" size={18} color={theme.textSecondary} />}
          />
          <NueronixTextField
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            }
          />

          {/* Role */}
          <Text style={styles.fieldLabel}>I want to:</Text>
          <View style={styles.segmentGroup}>
            <SegmentBtn value="student" current={role} onPress={setRole} label="📚  Learn" />
            <SegmentBtn value="teacher" current={role} onPress={setRole} label="👨‍🏫  Teach" />
          </View>

          {role === 'student' && (
            <>
              {/* Learning Pace */}
              <Text style={styles.fieldLabel}>Learning Pace:</Text>
              <View style={styles.segmentGroup}>
                <SegmentBtn value="slow" current={learningPace} onPress={setLearningPace} label="Slow" />
                <SegmentBtn value="moderate" current={learningPace} onPress={setLearningPace} label="Moderate" />
                <SegmentBtn value="fast" current={learningPace} onPress={setLearningPace} label="Fast" />
              </View>

              {/* Experience Level */}
              <Text style={styles.fieldLabel}>Experience Level:</Text>
              <View style={styles.segmentGroup}>
                <SegmentBtn value="beginner" current={experienceLevel} onPress={setExperienceLevel} label="Beginner" />
                <SegmentBtn value="intermediate" current={experienceLevel} onPress={setExperienceLevel} label="Intermediate" />
                <SegmentBtn value="professional" current={experienceLevel} onPress={setExperienceLevel} label="Pro" />
              </View>
            </>
          )}

          {/* Subjects */}
          <Text style={styles.fieldLabel}>{role === 'teacher' ? 'Subjects You Teach:' : 'Subjects to Learn:'}</Text>
          <View style={styles.subjectGrid}>
            {SUBJECTS.map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => toggleSubject(s)}
                style={[styles.subjectChip, selectedSubjects.includes(s) && styles.subjectChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.subjectChipText, selectedSubjects.includes(s) && styles.subjectChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <NueronixButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerBtn}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 36 },
  logoBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  logoLetter: { color: '#fff', fontWeight: '800', fontSize: 20 },
  brandName: { fontWeight: '700', fontSize: 20, color: theme.text },
  heading: { fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: 4 },
  subheading: { fontSize: 15, color: theme.textSecondary, marginBottom: 24 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#D32F2F18', borderRadius: 10,
    padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#D32F2F44',
  },
  errorText: { color: '#D32F2F', fontSize: 14, flex: 1 },
  fieldLabel: {
    fontSize: 14, fontWeight: '500', color: theme.textSecondary,
    marginBottom: 10, marginTop: 8,
  },
  segmentGroup: {
    flexDirection: 'row', gap: 8, marginBottom: 16,
  },
  segment: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: theme.border, borderRadius: 10,
    backgroundColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: `${colors.primary}22`,
    borderColor: colors.primary,
  },
  segmentText: { fontSize: 14, fontWeight: '500', color: theme.textSecondary },
  segmentTextActive: { color: colors.primary, fontWeight: '600' },
  subjectGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24,
  },
  subjectChip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 8, borderWidth: 1, borderColor: theme.border,
    backgroundColor: 'transparent',
  },
  subjectChipActive: {
    backgroundColor: `${colors.primary}20`,
    borderColor: colors.primary,
  },
  subjectChipText: { fontSize: 13, color: theme.textSecondary },
  subjectChipTextActive: { color: colors.primary, fontWeight: '600' },
  registerBtn: { marginBottom: 16 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: theme.textSecondary, fontSize: 15 },
  loginLink: { color: colors.primary, fontWeight: '600', fontSize: 15 },
});
