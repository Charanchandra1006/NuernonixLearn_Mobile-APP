import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, colors } from '../theme/colors';

interface CourseCardProps {
  title: string;
  description: string;
  difficulty: string;
  category: string;
  modulesCount: number;
  price?: number;
  isFree?: boolean;
  onPress: () => void;
  imageUrl?: string;
  isEnrolled?: boolean;
  progress?: number;
}

export const CourseCard = ({
  title, description, difficulty, category, modulesCount,
  price, isFree, onPress, imageUrl, isEnrolled, progress
}: CourseCardProps) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="book" size={32} color={theme.textSecondary} />
        </View>
      )}
      
      {isEnrolled && progress !== undefined && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: difficulty === 'beginner' ? '#4caf5022' : difficulty === 'intermediate' ? '#ff980022' : '#f4433622' }]}>
              <Text style={[styles.badgeText, { color: difficulty === 'beginner' ? '#4caf50' : difficulty === 'intermediate' ? '#ff9800' : '#f44336' }]}>
                {difficulty}
              </Text>
            </View>
            <Text style={styles.category}>{category}</Text>
          </View>
          {!isEnrolled && (
            <Text style={[styles.price, isFree && { color: '#4caf50' }]}>
              {isFree ? 'Free' : `$${price}`}
            </Text>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="layers" size={14} color={theme.textSecondary} />
            <Text style={styles.footerText}>{modulesCount} modules</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: { width: '100%', height: 140, resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: 140, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  progressBar: { height: 4, backgroundColor: '#1a1a1a' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  category: { fontSize: 12, color: theme.textSecondary, fontWeight: '600' },
  price: { fontSize: 14, fontWeight: '700', color: theme.text },
  title: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8 },
  description: { fontSize: 13, color: theme.textSecondary, lineHeight: 20, marginBottom: 16 },
  footer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: theme.textSecondary },
});
