import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { NueronixTextField } from '../components/NueronixTextField';
import { NueronixButton } from '../components/NueronixButton';
import { NueronixCard } from '../components/NueronixCard';
import { typography } from '../theme/typography';
import { theme } from '../theme/colors';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simulate login for now
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Dashboard');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={[typography.h2, styles.brandName]}>NueronixLearn</Text>
          <Text style={[typography.body1, styles.subtitle]}>Sign in to continue your learning journey.</Text>
        </View>

        <NueronixCard style={styles.card}>
          <NueronixTextField
            label="Email Address"
            placeholder="student@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <NueronixTextField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <NueronixButton
            title="Log In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />
          
          <NueronixButton
            title="Don't have an account? Register"
            onPress={() => {}}
            variant="text"
          />
        </NueronixCard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  brandName: {
    color: theme.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: theme.textSecondary,
    textAlign: 'center',
  },
  card: {
    padding: 24,
  },
  loginBtn: {
    marginTop: 16,
    marginBottom: 8,
  },
});
