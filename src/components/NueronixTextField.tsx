import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { theme, colors } from '../theme/colors';

interface NueronixTextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  autoComplete?: any;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  containerStyle?: ViewStyle;
  [key: string]: any;
}

import { TextInput } from 'react-native';

export const NueronixTextField: React.FC<NueronixTextFieldProps> = ({
  label, placeholder, value, onChangeText, secureTextEntry, keyboardType,
  autoCapitalize, autoComplete, leftIcon, rightIcon, error, containerStyle, ...rest
}) => {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, focused && styles.labelFocused, error && styles.labelError]}>
          {label}
        </Text>
      )}
      <View style={[styles.inputRow, focused && styles.inputRowFocused, error && styles.inputRowError]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeft, rightIcon && styles.inputWithRight]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16, width: '100%' },
  label: {
    fontSize: 13, fontWeight: '500',
    color: theme.textSecondary, marginBottom: 6,
  },
  labelFocused: { color: colors.primary, fontWeight: '600' },
  labelError: { color: colors.error },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, overflow: 'hidden',
  },
  inputRowFocused: { borderColor: colors.primary, borderWidth: 2 },
  inputRowError: { borderColor: colors.error },
  iconLeft: { paddingLeft: 14, paddingRight: 4 },
  iconRight: { paddingRight: 14, paddingLeft: 4 },
  input: {
    flex: 1, color: theme.text,
    fontSize: 15, paddingVertical: 13, paddingHorizontal: 14,
  },
  inputWithLeft: { paddingLeft: 4 },
  inputWithRight: { paddingRight: 4 },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4 },
});
