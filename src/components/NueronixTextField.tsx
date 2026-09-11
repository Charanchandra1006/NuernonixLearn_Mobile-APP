import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { theme } from '../theme/colors';
import { typography } from '../theme/typography';

interface NueronixTextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const NueronixTextField: React.FC<NueronixTextFieldProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          typography.body2, 
          styles.label, 
          isFocused && styles.labelFocused,
          error && styles.labelError
        ]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={theme.textSecondary}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text style={[typography.caption, styles.errorText]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: theme.textSecondary,
    marginBottom: 6,
  },
  labelFocused: {
    color: theme.primary,
    fontWeight: '600',
  },
  labelError: {
    color: theme.error,
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.text,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: theme.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: theme.error,
  },
  errorText: {
    color: theme.error,
    marginTop: 4,
  },
});
