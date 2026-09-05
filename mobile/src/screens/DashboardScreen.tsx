import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function DashboardScreen() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back!</Text>
      <Text style={styles.subtitle}>Logged in as: {user?.email}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Academic Risk Score</Text>
        <Text style={styles.score}>Low</Text>
      </View>
      <Button title="Logout" onPress={logout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  card: { padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 40, alignItems: 'center' },
  cardTitle: { fontSize: 18, marginBottom: 10 },
  score: { fontSize: 24, fontWeight: 'bold', color: 'green' }
});
