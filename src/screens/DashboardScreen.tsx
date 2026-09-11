import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NueronixCard } from '../components/NueronixCard';
import { NueronixButton } from '../components/NueronixButton';
import { typography } from '../theme/typography';
import { theme } from '../theme/colors';

export const DashboardScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h3, styles.title]}>Welcome back, Student!</Text>
          <Text style={[typography.body1, styles.subtitle]}>Let's continue your learning.</Text>
        </View>

        <NueronixCard style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={typography.h4}>12</Text>
              <Text style={typography.caption}>Day Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={typography.h4}>450</Text>
              <Text style={typography.caption}>XP Points</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[typography.h4, { color: theme.success }]}>Low</Text>
              <Text style={typography.caption}>Cognitive Load</Text>
            </View>
          </View>
        </NueronixCard>

        <NueronixCard style={styles.aiCard}>
          <Text style={[typography.h5, styles.aiTitle]}>NeuroBot Suggests</Text>
          <Text style={typography.body2}>
            Based on your recent quizzes, you should review "Algebraic Expressions" before moving on to Calculus.
          </Text>
          <NueronixButton 
            title="Start Review" 
            onPress={() => {}} 
            style={styles.actionBtn}
          />
        </NueronixCard>

        <NueronixButton 
          title="Log Out" 
          variant="outlined"
          onPress={() => navigation.replace('Login')}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    padding: 24,
  },
  header: {
    marginTop: 24,
    marginBottom: 24,
  },
  title: {
    color: theme.text,
  },
  subtitle: {
    color: theme.textSecondary,
    marginTop: 4,
  },
  statsCard: {
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
  },
  aiCard: {
    borderColor: theme.primary,
    borderWidth: 1,
    backgroundColor: 'rgba(46, 125, 50, 0.1)', // subtle green tint
    marginBottom: 32,
  },
  aiTitle: {
    color: theme.primary,
    marginBottom: 8,
  },
  actionBtn: {
    marginTop: 16,
  },
  logoutBtn: {
    marginTop: 'auto',
  },
});
