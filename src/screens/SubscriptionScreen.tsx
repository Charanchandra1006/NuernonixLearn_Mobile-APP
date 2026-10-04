import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, colors } from '../theme/colors';
import { getOfferings, purchasePackage } from '../services/revenueCatService';
import { NueronixButton } from '../components/NueronixButton';

export const SubscriptionScreen = ({ navigation }: any) => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    getOfferings().then(pkgs => {
      setPackages(pkgs);
      setLoading(false);
    });
  }, []);

  const handlePurchase = async (pkg: any) => {
    setPurchasing(true);
    const success = await purchasePackage(pkg);
    setPurchasing(false);
    if (success) {
      Alert.alert('Success', 'Welcome to Premium AI Learning Twin!', [
        { text: 'Awesome', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Notice', 'Purchase was cancelled or failed.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Premium Features</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Ionicons name="star" size={60} color="#ffb74d" style={{ marginBottom: 20 }} />
        <Text style={styles.hero}>Unlock the ultimate AI Learning Twin</Text>
        <Text style={styles.desc}>Get unlimited 24/7 access to personalized AI tutoring, real-time analytics, and advanced predictive grading.</Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.pricing}>
            {packages.map((pkg, i) => (
              <View key={i} style={styles.card}>
                <View>
                  <Text style={styles.pkgTitle}>{pkg.product.title}</Text>
                  <Text style={styles.pkgPrice}>{pkg.product.priceString}</Text>
                </View>
                <NueronixButton
                  title="Subscribe"
                  onPress={() => handlePurchase(pkg)}
                  loading={purchasing}
                  style={styles.subBtn}
                />
              </View>
            ))}
            {packages.length === 0 && (
              <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>No subscription packages available right now.</Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  hero: { fontSize: 24, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 12 },
  desc: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  pricing: { width: '100%', gap: 16 },
  card: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: '#ffb74d55',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pkgTitle: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 4 },
  pkgPrice: { fontSize: 20, fontWeight: '800', color: '#ffb74d' },
  subBtn: { width: 120, height: 44 }
});
