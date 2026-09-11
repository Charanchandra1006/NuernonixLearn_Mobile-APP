import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  SafeAreaView, ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, colors } from '../theme/colors';
import { coursesAPI } from '../services/api';

const DIFFICULTIES = ['All', 'beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['All', 'Programming', 'Data Science', 'Web Development', 'Machine Learning', 'Mathematics', 'Science'];

const DIFF_COLORS: Record<string, string> = {
  beginner: '#4caf50',
  intermediate: '#ffb74d',
  advanced: '#e57373',
};

const CourseCard = ({ course, onPress }: { course: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.courseCard} onPress={onPress} activeOpacity={0.85}>
    {/* Thumbnail placeholder with first letter */}
    <View style={styles.courseThumbnail}>
      <Text style={styles.courseLetter}>{course.title?.charAt(0) || 'C'}</Text>
      <View style={[styles.diffBadge, { backgroundColor: `${DIFF_COLORS[course.difficulty] || '#888'}22`, borderColor: `${DIFF_COLORS[course.difficulty] || '#888'}55` }]}>
        <Text style={[styles.diffText, { color: DIFF_COLORS[course.difficulty] || '#888' }]}>
          {course.difficulty}
        </Text>
      </View>
    </View>

    <View style={styles.courseBody}>
      <Text style={styles.courseCategory} numberOfLines={1}>{course.category?.toUpperCase()}</Text>
      <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
      <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>

      <View style={styles.courseFooter}>
        <View style={styles.courseMetaRow}>
          <Ionicons name="layers-outline" size={12} color={theme.textSecondary} />
          <Text style={styles.courseMeta}>{course.modules?.length || 0} modules</Text>
        </View>
        <Text style={[styles.coursePrice, course.isFree && { color: '#4caf50' }]}>
          {course.isFree || !course.price ? 'Free' : `$${course.price}`}
        </Text>
      </View>

      <TouchableOpacity style={styles.viewBtn} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.viewBtnText}>View course</Text>
        <Ionicons name="arrow-forward" size={13} color={colors.primary} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export const CoursesScreen = ({ navigation }: any) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchCourses = useCallback(async (reset = false) => {
    const pg = reset ? 1 : page;
    if (reset) { setLoading(true); setPage(1); }
    else setLoadingMore(true);
    try {
      const res = await coursesAPI.getAll({
        search: search || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        page: pg,
      });
      const newCourses = res.data.courses || [];
      if (reset) setCourses(newCourses);
      else setCourses(prev => [...prev, ...newCourses]);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch { /* silent */ } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, category, difficulty, page]);

  useEffect(() => { fetchCourses(true); }, [search, category, difficulty]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      setPage(p => p + 1);
    }
  };

  useEffect(() => {
    if (page > 1) fetchCourses(false);
  }, [page]);

  const clearFilters = () => { setSearch(''); setCategory(''); setDifficulty(''); setPage(1); };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.overline}>CATALOGUE</Text>
          <Text style={styles.title}>Explore Courses</Text>
        </View>
        <Text style={styles.countText}>{courses.length} courses</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={v => { setSearch(v); setPage(1); }}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.filterChip, (c === 'All' ? !category : category === c) && styles.filterChipActive]}
            onPress={() => { setCategory(c === 'All' ? '' : c); setPage(1); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, (c === 'All' ? !category : category === c) && styles.filterChipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Difficulty filter */}
      <View style={styles.diffRow}>
        {DIFFICULTIES.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.diffChip, (d === 'All' ? !difficulty : difficulty === d) && styles.diffChipActive]}
            onPress={() => { setDifficulty(d === 'All' ? '' : d); setPage(1); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.diffChipText, (d === 'All' ? !difficulty : difficulty === d) && styles.diffChipTextActive]}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        {(search || category || difficulty) && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>No courses found</Text>
          <TouchableOpacity onPress={clearFilters} style={styles.clearBtn2}>
            <Text style={styles.clearBtnText}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} /> : null}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() => navigation.navigate('CourseDetail', { courseId: item._id, course: item })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  overline: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, color: theme.textSecondary, marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '700', color: theme.text, letterSpacing: -0.5 },
  countText: { fontSize: 13, color: theme.textSecondary },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: theme.surface, borderRadius: 10,
    borderWidth: 1, borderColor: theme.border,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: theme.text, fontSize: 15 },
  filterRow: { marginTop: 10 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: theme.border,
    backgroundColor: 'transparent',
  },
  filterChipActive: { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
  filterChipText: { fontSize: 13, color: theme.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: colors.primary, fontWeight: '600' },
  diffRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16,
    marginTop: 8, marginBottom: 4, alignItems: 'center',
  },
  diffChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: theme.border,
  },
  diffChipActive: { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
  diffChipText: { fontSize: 12, color: theme.textSecondary, fontWeight: '500' },
  diffChipTextActive: { color: colors.primary, fontWeight: '600' },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  clearBtnText: { color: theme.textSecondary, fontSize: 13 },
  clearBtn2: { marginTop: 12 },
  listContent: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 80 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: theme.textSecondary, fontSize: 16, marginTop: 12, marginBottom: 8 },

  // Course card
  courseCard: {
    backgroundColor: theme.surface,
    borderRadius: 12, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border, overflow: 'hidden',
  },
  courseThumbnail: {
    height: 110, backgroundColor: '#0d0d0d',
    borderBottomWidth: 1, borderBottomColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },
  courseLetter: {
    fontSize: 56, fontWeight: '800',
    color: `${colors.primary}22`, letterSpacing: -3,
  },
  diffBadge: {
    position: 'absolute', top: 10, left: 10,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
  },
  diffText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  courseBody: { padding: 14 },
  courseCategory: { fontSize: 10, fontWeight: '600', letterSpacing: 1, color: theme.textSecondary, marginBottom: 4 },
  courseTitle: { fontSize: 16, fontWeight: '600', color: theme.text, lineHeight: 22, marginBottom: 6 },
  courseDesc: { fontSize: 13, color: theme.textSecondary, lineHeight: 19, marginBottom: 10 },
  courseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  courseMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  courseMeta: { fontSize: 12, color: theme.textSecondary },
  coursePrice: { fontSize: 14, fontWeight: '600', color: theme.text },
  viewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: `${colors.primary}55`,
    borderRadius: 8, paddingVertical: 9,
  },
  viewBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
});
