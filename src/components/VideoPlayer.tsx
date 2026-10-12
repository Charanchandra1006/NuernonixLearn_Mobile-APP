import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoPlayerProps {
  url: string;
  title?: string;
  duration?: string;
}

export const VideoPlayer = ({ url, title, duration }: VideoPlayerProps) => {
  const player = useVideoPlayer(url, p => {
    p.loop = false;
  });

  return (
    <View style={styles.container}>
      <View style={styles.videoPlaceholder}>
        <VideoView
          style={styles.video}
          player={player}
          nativeControls={true}
          allowsPictureInPicture
        />
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
  video: {
    width: '100%',
    height: '100%',
  },
});
