import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NueronixButton } from '../components/NueronixButton';
import { theme, colors } from '../theme/colors';
import { coursesAPI } from '../services/api';

const DIFF_COLORS: Record<string, string> = {
  beginner: '#4caf50', intermediate: '#ffb74d', advanced: '#e57373',
};

const DEFAULT_LEARN = [
  'Adaptive learning powered by AI',
  'Real-time progress tracking',
  'Personalised recommendations',
  'Cognitive load monitoring',
];

export const CourseDetailScreen = ({ navigation, route }: any) => {
  const { courseId, course: preloaded } = route.params;
  const [course, setCourse] = useState<any>(preloaded || null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(!preloaded);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (preloaded) {
      coursesAPI.getById(courseId).then(res => {
        setCourse(res.data.course);
        setIsEnrolled(res.data.isEnrolled || false);
      }).catch(() => {});
    } else {
      setLoading(true);
      coursesAPI.getById(courseId).then(res => {
        setCourse(res.data.course);
        setIsEnrolled(res.data.isEnrolled || false);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await coursesAPI.enroll(courseId);
      setIsEnrolled(true);
      navigation.navigate('Learn', { courseId });
    } catch (err: any) {
      Alert.alert('Enroll failed', err.response?.data?.error || 'Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><Text style={styles.errorText}>Course not found</Text></View>
      </SafeAreaView>
    );
  }

  const diffColor = DIFF_COLORS[course.difficulty] || '#888';
  const whatYouLearn = course.whatYouWillLearn?.length > 0 ? course.whatYouWillLearn : DEFAULT_LEARN;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color={theme.text} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero thumbnail */}
        <View style={styles.hero}>
          <Text style={styles.heroLetter}>{course.title?.charAt(0)}</Text>
          <View style={[styles.diffBadge, { backgroundColor: `${diffColor}22`, borderColor: `${diffColor}55` }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>{course.difficulty}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title + Tags */}
          <Text style={styles.category}>{course.category?.toUpperCase()}</Text>
          <Text style={styles.title}>{course.title}</Text>

          <View style={styles.tagRow}>
            {[course.difficulty, course.category].filter(Boolean).map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {(course.isFree || !course.price) ? (
              <View style={[styles.tag, styles.freeTag]}>
                <Text style={[styles.tagText, { color: '#4caf50' }]}>Free</Text>
              </View>
            ) : null}
          </View>

          {/* Description */}
          <Text style={styles.description}>{course.description || 'No description available.'}</Text>

          {/* Instructor & Duration */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color={theme.textSecondary} />
              <Text style={styles.metaText}>{course.instructor?.name || 'Expert Instructor'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="layers-outline" size={14} color={theme.textSecondary} />
              <Text style={styles.metaText}>{course.modules?.length || 0} modules</Text>
            </View>
          </View>

          {/* What you'll learn */}
          <Text style={styles.sectionTitle}>What you'll learn</Text>
          <View style={styles.learnGrid}>
            {whatYouLearn.map((item: string, i: number) => (
              <View key={i} style={styles.learnItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                <Text style={styles.learnText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Modules list */}
          <Text style={styles.sectionTitle}>Course Content ({course.modules?.length || 0} modules)</Text>
          {(course.modules?.length > 0 ? course.modules : []).map((mod: any, i: number) => (
            <View key={mod._id || i} style={[styles.moduleItem, i < (course.modules?.length || 0) - 1 && styles.moduleBorder]}>
              <View style={styles.moduleIcon}>
                <Ionicons
                  name={mod.type === 'quiz' ? 'help-circle-outline' : mod.type === 'text' ? 'document-text-outline' : 'play-circle-outline'}
                  size={18} color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.moduleName}>{i + 1}. {mod.title}</Text>
                <Text style={styles.moduleMeta}>{mod.duration || 10} min · {mod.type || 'video'}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky enroll button */}
      <View style={styles.stickyBottom}>
        {isEnrolled ? (
          <NueronixButton
            title="Continue Learning"
            onPress={() => navigation.navigate('Learn', { courseId })}
          />
        ) : (
          <NueronixButton
            title={course.isFree || !course.price ? 'Enroll for Free' : `Enroll — $${course.price}`}
            onPress={handleEnroll}
            loading={enrolling}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: theme.textSecondary, fontSize: 16 },
  backBtn: {
    position: 'absolute', top: 16, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
    padding: 8,
  },
  hero: {
    height: 200, backgroundColor: '#0d0d0d',
    borderBottomWidth: 1, borderBottomColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },
  heroLetter: { fontSize: 80, fontWeight: '900', color: `${colors.primary}22`, letterSpacing: -4 },
  diffBadge: {
    position: 'absolute', bottom: 12, left: 16,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1,
  },
  diffText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  content: { padding: 20 },
  category: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: theme.textSecondary, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '700', color: theme.text, letterSpacing: -0.5, marginBottom: 12 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, borderWidth: 1, borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  freeTag: { borderColor: '#4caf5044', backgroundColor: '#4caf5010' },
  tagText: { fontSize: 12, color: theme.textSecondary, fontWeight: '500' },
  description: { fontSize: 15, color: theme.textSecondary, lineHeight: 23, marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 20, marginBottom: 24 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: theme.textSecondary },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: theme.text, marginBottom: 12, marginTop: 4 },
  learnGrid: { gap: 10, marginBottom: 24 },
  learnItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  learnText: { flex: 1, fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
  moduleItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
  },
  moduleBorder: { borderBottomWidth: 1, borderBottomColor: theme.border },
  moduleIcon: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center', justifyContent: 'center',
  },
  moduleName: { fontSize: 14, fontWeight: '600', color: theme.text, marginBottom: 2 },
  moduleMeta: { fontSize: 12, color: theme.textSecondary },
  stickyBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: '#000',
    borderTopWidth: 1, borderTopColor: theme.border,
  },
});
