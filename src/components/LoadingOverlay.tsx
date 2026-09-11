import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { theme, colors } from '../theme/colors';

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
}

export const LoadingOverlay = ({ visible, text = 'Loading...' }: LoadingOverlayProps) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
          {text ? <Text style={styles.text}>{text}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: theme.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    minWidth: 160,
  },
  text: {
    color: theme.text,
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
  },
});
