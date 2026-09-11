import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, colors } from '../theme/colors';

interface ChatBubbleProps {
  message: string;
  isBot: boolean;
  timestamp?: string;
}

export const ChatBubble = ({ message, isBot, timestamp }: ChatBubbleProps) => {
  return (
    <View style={[styles.container, isBot ? styles.botContainer : styles.userContainer]}>
      <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
        <Text style={[styles.text, isBot ? styles.botText : styles.userText]}>
          {message}
        </Text>
      </View>
      {timestamp && (
        <Text style={styles.timestamp}>{timestamp}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '85%',
  },
  botContainer: {
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  botBubble: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  botText: {
    color: theme.text,
  },
  userText: {
    color: '#000',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 10,
    color: theme.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
    paddingHorizontal: 4,
  },
});
