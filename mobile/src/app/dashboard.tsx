import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { router } from 'expo-router';
import { apiClient } from '../services/apiClient';

export default function DashboardScreen() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const [riskData, setRiskData] = useState<{risk_tier: string, risk_score: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/predictions/risk')
      .then(res => {
        setRiskData(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch risk score:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back!</Text>
      <Text style={styles.subtitle}>Logged in as: {user?.email}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Academic Risk Score</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Text style={[styles.score, { color: riskData?.risk_tier === 'high' ? 'red' : 'green' }]}>
            {riskData?.risk_tier?.toUpperCase() || "UNKNOWN"} ({riskData?.risk_score})
          </Text>
        )}
      </View>
      <Button title="Logout" onPress={handleLogout} color="red" />
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
