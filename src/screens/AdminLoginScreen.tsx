import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform,
  SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixCard } from '../components/NueronixCard';
import { NueronixButton } from '../components/NueronixButton';
import { theme, colors } from '../theme/colors';
import { adminAPI } from '../services/api';
import useAuthStore from '../store/authStore';

export const AdminLoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    try {
      const res = await adminAPI.login(username, password);
      // For mobile, we just set the admin user to the main auth store
      // The API response contains token and admin object
      // We simulate merging into the main store
      setUser({
        _id: res.data.admin._id,
        name: res.data.admin.username,
        email: res.data.admin.email,
        role: 'admin',
        isSuperAdmin: res.data.admin.isSuperAdmin,
      });
      navigation.replace('AdminPanel');
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.center}>
        <NueronixCard style={styles.card}>
          <View style={styles.iconBox}>
            <Ionicons name="lock-closed" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>Admin Login</Text>
          <Text style={styles.subtitle}>Access admin panel</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="admin"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
            />
          </View>

          <NueronixButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 12 }}
          />
        </NueronixCard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 400, padding: 24, alignItems: 'center' },
  iconBox: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: theme.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: theme.textSecondary, marginBottom: 32 },
  inputWrap: { width: '100%', marginBottom: 16 },
  inputLabel: { fontSize: 13, color: theme.textSecondary, marginBottom: 8 },
  input: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 14, color: theme.text, fontSize: 15 },
});
