import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixTextField } from '../components/NueronixTextField';
import { NueronixButton } from '../components/NueronixButton';
import { theme, colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuthStore } from '../store/authStore';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const { user } = useAuthStore.getState();
      if (user?.role === 'teacher') {
        navigation.replace('TeacherApp');
      } else if (!user?.onboardingCompleted) {
        navigation.replace('Onboarding');
      } else {
        navigation.replace('StudentApp');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + Brand */}
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>N</Text>
            </View>
            <Text style={styles.brandName}>NeuronixLearn</Text>
          </View>

          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Sign in to continue your learning journey</Text>

          {/* Feature badges */}
          <View style={styles.badgeRow}>
            {['🔒 Secure', '⚡ Fast', '📚 500+ Courses'].map((b) => (
              <View key={b} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#D32F2F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <NueronixTextField
              label="Email address"
              placeholder="student@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon={<Ionicons name="mail-outline" size={18} color={theme.textSecondary} />}
            />
            <NueronixTextField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />}
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

            <NueronixButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.signInBtn}
            />
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Create one</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: {
    flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: 28, paddingVertical: 40,
  },
  brandRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  logoLetter: { color: '#fff', fontWeight: '800', fontSize: 20 },
  brandName: { fontWeight: '700', fontSize: 20, color: theme.text },
  heading: {
    fontSize: 32, fontWeight: '700',
    color: theme.text, marginBottom: 6,
  },
  subheading: {
    fontSize: 15, color: theme.textSecondary,
    marginBottom: 24, lineHeight: 22,
  },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 28, flexWrap: 'wrap' },
  badge: {
    backgroundColor: `${colors.primary}18`,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#D32F2F18',
    borderRadius: 10, padding: 12, marginBottom: 20,
    borderWidth: 1, borderColor: '#D32F2F44',
  },
  errorText: { color: '#D32F2F', fontSize: 14, flex: 1 },
  form: { gap: 4 },
  signInBtn: { marginTop: 8 },
  registerRow: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: 28, alignItems: 'center',
  },
  registerText: { color: theme.textSecondary, fontSize: 15 },
  registerLink: { color: colors.primary, fontWeight: '600', fontSize: 15 },
});
