import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../theme/colors';
import { typography } from '../theme/typography';

interface NueronixButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const NueronixButton: React.FC<NueronixButtonProps> = ({
  title,
  onPress,
  variant = 'contained',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'outlined':
        return [styles.container, styles.outlined, style];
      case 'text':
        return [styles.container, styles.text, style];
      case 'contained':
      default:
        return [styles.container, styles.contained, style];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outlined':
      case 'text':
        return [typography.button, styles.outlinedText, textStyle];
      case 'contained':
      default:
        return [typography.button, styles.containedText, textStyle];
    }
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'contained' ? '#FFFFFF' : theme.primary} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contained: {
    backgroundColor: theme.primary,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.border,
  },
  text: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  containedText: {
    color: '#FFFFFF',
  },
  outlinedText: {
    color: theme.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
