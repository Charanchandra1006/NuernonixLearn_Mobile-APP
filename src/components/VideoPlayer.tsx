import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

// Note: In a real implementation, you would use expo-av:
// import { Video, ResizeMode } from 'expo-av';

interface VideoPlayerProps {
  url: string;
  title?: string;
  duration?: string;
}

export const VideoPlayer = ({ url, title, duration }: VideoPlayerProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.videoPlaceholder}>
        <Ionicons name="play-circle" size={64} color={theme.textSecondary} />
        <Text style={styles.placeholderText}>Video Player Ready</Text>
        <Text style={styles.urlText} numberOfLines={1}>{url}</Text>
        {/* <Video source={{ uri: url }} useNativeControls resizeMode={ResizeMode.CONTAIN} style={styles.video} /> */}
      </View>
      
      {(title || duration) && (
        <View style={styles.info}>
          {title && <Text style={styles.title}>{title}</Text>}
          {duration && <Text style={styles.duration}>{duration} mins</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  videoPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: theme.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  urlText: {
    color: theme.border,
    fontSize: 10,
    marginTop: 4,
  },
  info: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  duration: {
    fontSize: 12,
    color: theme.textSecondary,
  },
});
