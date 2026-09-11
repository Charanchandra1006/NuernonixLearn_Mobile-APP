import { StyleSheet } from 'react-native';
import { theme } from './colors';

export const typography = StyleSheet.create({
  h1: {
    fontSize: 44,
    fontWeight: 'bold',
    letterSpacing: -0.88, // -0.02em
    color: theme.text,
  },
  h2: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -0.36, // -0.01em
    color: theme.text,
  },
  h3: {
    fontSize: 30,
    fontWeight: '600',
    color: theme.text,
  },
  h4: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.text,
  },
  h5: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
  },
  h6: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  body1: {
    fontSize: 17,
    fontWeight: '400',
    color: theme.text,
  },
  body2: {
    fontSize: 15,
    fontWeight: '400',
    color: theme.text,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: theme.textSecondary,
  },
});
