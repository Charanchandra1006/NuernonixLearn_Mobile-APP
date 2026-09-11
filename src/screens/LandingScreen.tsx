import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, StatusBar, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { NueronixButton } from '../components/NueronixButton';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const STATS = [
  { value: '50K+', label: 'Active learners' },
  { value: '200+', label: 'Subjects covered' },
  { value: '95%',  label: 'Completion rate' },
  { value: '4.9',  label: 'Average rating' },
];

const FEATURES = [
  { num: '01', title: 'AI Roadmap Generation', desc: 'Add any subject and the AI instantly generates a structured learning roadmap with topics, subtopics, videos, and articles.' },
  { num: '02', title: 'Adaptive Difficulty',   desc: 'Content difficulty shifts automatically based on your performance — never too easy, never overwhelming.' },
  { num: '03', title: 'Deep Analytics',        desc: 'Track retention rates, time-on-task, streak consistency, and weak topics — all in one dashboard.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Add a subject',    desc: 'Type any subject. The AI generates a full roadmap from basics to advanced.' },
  { step: '02', title: 'Topics appear',    desc: 'A structured list of topics in learning order, saved to your progress tracker.' },
  { step: '03', title: 'Click a subtopic', desc: 'Instantly loads curated YouTube videos and blog articles for that exact concept.' },
  { step: '04', title: 'Track progress',   desc: 'Mark topics complete. Watch your progress bar fill as you master the subject.' },
];

export const LandingScreen = ({ navigation }: any) => {
  const scrollY = React.useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Animated.ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* ─── HERO ─────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#0a0a0a', '#0f1a0f', '#0a0a0a']}
          style={styles.hero}
        >
          {/* Badge */}
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>AI-POWERED LEARNING PLATFORM</Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>
            Learn smarter.{'\n'}
            <Text style={styles.headlineAccent}>Not harder.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            NeuronixLearn generates a personalised AI roadmap for any subject —
            with topics, subtopics, videos, and articles, all in one place.
          </Text>

          {/* CTAs */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaPrimaryText}>Start for free</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaOutlined}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaOutlinedText}>Log in</Text>
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <View key={s.label} style={[styles.statItem, i < STATS.length - 1 && styles.statBorder]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ─── FEATURES ────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>WHY NEURONIXLEARN</Text>
          <Text style={styles.sectionTitle}>Built around how you learn</Text>
          <Text style={styles.sectionSubtitle}>
            Most platforms deliver content. We deliver understanding — through a system that reads your progress and adjusts automatically.
          </Text>

          {FEATURES.map((f, i) => (
            <View key={f.num} style={[styles.featureRow, i === 0 && styles.featureRowFirst]}>
              <Text style={styles.featureNum}>{f.num}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </View>
          ))}
        </View>

        {/* ─── HOW IT WORKS ───────────────────────────────────────────── */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={styles.sectionEyebrow}>THE FLOW</Text>
          <Text style={styles.sectionTitle}>From subject to mastery</Text>

          <View style={styles.howGrid}>
            {HOW_IT_WORKS.map((item) => (
              <View key={item.step} style={styles.howCard}>
                <Text style={styles.howStepNum}>{item.step}</Text>
                <Text style={styles.howTitle}>{item.title}</Text>
                <Text style={styles.howDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── CTA SECTION ─────────────────────────────────────────────── */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaSectionTitle}>Ready to learn differently?</Text>
          <Text style={styles.ctaSectionSubtitle}>
            Join thousands of students already using NeuronixLearn to master any subject faster.
          </Text>
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaPrimaryText}>Create free account</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaOutlined}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaOutlinedText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── FOOTER ──────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>NeuronixLearn</Text>
          <Text style={styles.footerSub}>AI-Powered Adaptive Learning</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  // Hero
  hero: {
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: `${colors.primary}44`,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: `${colors.primary}0d`,
    marginBottom: 32,
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10, fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.primary,
  },
  headline: {
    fontSize: 52, fontWeight: '800',
    lineHeight: 56, letterSpacing: -2,
    color: '#fff', marginBottom: 20,
  },
  headlineAccent: { color: colors.primary },
  heroSubtitle: {
    fontSize: 16, color: '#777',
    lineHeight: 26, marginBottom: 36,
    maxWidth: width - 48,
  },
  ctaRow: {
    flexDirection: 'row', gap: 12,
    flexWrap: 'wrap', marginBottom: 40,
  },
  ctaPrimary: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10, paddingVertical: 14, paddingHorizontal: 24,
  },
  ctaPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  ctaOutlined: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: `${colors.primary}66`,
    borderRadius: 10, paddingVertical: 14, paddingHorizontal: 24,
  },
  ctaOutlinedText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  statsRow: {
    flexDirection: 'row', borderTopWidth: 1,
    borderTopColor: '#1a1a1a', paddingTop: 24,
    flexWrap: 'wrap', gap: 24,
  },
  statItem: { minWidth: 70 },
  statBorder: {},
  statValue: {
    fontSize: 28, fontWeight: '800',
    letterSpacing: -1, color: '#fff',
  },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },

  // Sections
  section: { paddingHorizontal: 24, paddingVertical: 56 },
  sectionAlt: { backgroundColor: '#080808' },
  sectionEyebrow: {
    fontSize: 10, fontWeight: '700',
    letterSpacing: 1.5, color: colors.primary,
    textTransform: 'uppercase', marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 32, fontWeight: '700',
    letterSpacing: -1, color: '#fff',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 15, color: '#777',
    lineHeight: 24, marginBottom: 32,
  },

  // Features
  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 24,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
    gap: 16,
  },
  featureRowFirst: { borderTopWidth: 1, borderTopColor: '#1a1a1a' },
  featureNum: { fontSize: 13, fontWeight: '700', color: '#2a2a2a', minWidth: 28, paddingTop: 2 },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 17, fontWeight: '600', color: '#fff', marginBottom: 6 },
  featureDesc: { fontSize: 14, color: '#777', lineHeight: 22 },

  // How it works
  howGrid: { gap: 12 },
  howCard: {
    backgroundColor: '#111',
    borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: '#1a1a1a',
  },
  howStepNum: {
    fontSize: 36, fontWeight: '900',
    color: '#1e1e1e', letterSpacing: -2,
    lineHeight: 40, marginBottom: 8,
  },
  howTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  howDesc: { fontSize: 13, color: '#666', lineHeight: 20 },

  // CTA Section
  ctaSection: {
    paddingHorizontal: 24, paddingVertical: 64,
    alignItems: 'center',
  },
  ctaSectionTitle: {
    fontSize: 36, fontWeight: '800',
    letterSpacing: -1.5, color: '#fff',
    textAlign: 'center', marginBottom: 12,
  },
  ctaSectionSubtitle: {
    fontSize: 15, color: '#777', lineHeight: 24,
    textAlign: 'center', marginBottom: 36,
    paddingHorizontal: 16,
  },

  // Footer
  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 20,
    borderTopWidth: 1, borderTopColor: '#1a1a1a',
    alignItems: 'center',
  },
  footerBrand: { fontSize: 13, fontWeight: '700', color: '#333' },
  footerSub: { fontSize: 11, color: '#333' },
});
