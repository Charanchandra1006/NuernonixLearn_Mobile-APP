import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, colors } from '../theme/colors';

interface RoadmapNodeProps {
  title: string;
  description?: string;
  status: 'completed' | 'in-progress' | 'locked';
  isLast?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}

export const RoadmapNode = ({ title, description, status, isLast, onPress, children }: RoadmapNodeProps) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in-progress': return colors.primary;
      case 'locked': return theme.textSecondary;
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'play-circle';
      case 'locked': return 'lock-closed';
    }
  };

  const handlePress = () => {
    if (children) {
      setExpanded(!expanded);
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <View style={styles.container}>
      {/* Timeline Line */}
      {!isLast && (
        <View style={[styles.line, { backgroundColor: status === 'completed' ? '#4caf50' : '#333' }]} />
      )}

      {/* Node Content */}
      <TouchableOpacity 
        style={styles.node} 
        activeOpacity={0.7} 
        onPress={handlePress}
        disabled={status === 'locked' && !children}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={getIcon()} size={24} color={getStatusColor()} />
        </View>
        
        <View style={styles.textContent}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, status === 'locked' && styles.titleLocked]}>
              {title}
            </Text>
            {children && (
              <Ionicons 
                name={expanded ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={theme.textSecondary} 
              />
            )}
          </View>
          
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Children Expansion */}
      {expanded && children && (
        <View style={styles.childrenContainer}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingLeft: 12,
    marginBottom: 16,
  },
  line: {
    position: 'absolute',
    left: 23,
    top: 30,
    bottom: -16,
    width: 2,
    zIndex: 0,
  },
  node: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    zIndex: 1,
  },
  iconContainer: {
    marginRight: 16,
    marginTop: 2,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  textContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  titleLocked: {
    color: theme.textSecondary,
  },
  description: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  childrenContainer: {
    marginTop: 16,
    marginLeft: 32,
  },
});
