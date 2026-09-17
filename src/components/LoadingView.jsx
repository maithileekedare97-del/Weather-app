import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

export default function LoadingView({ message = 'Fetching weather data...' }) {
  return (
    <View style={styles.container}>
      <View style={styles.indicatorWrapper}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginBottom: THEME.spacing.md,
  },
  message: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
});
