import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { formatTemp } from '../services/weatherApi';

export default function ForecastList({ forecast, unit = 'C' }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={16} color={THEME.colors.textSecondary} />
        <Text style={styles.title}>7-Day Forecast</Text>
      </View>

      <View style={styles.card}>
        {forecast.map((item, index) => {
          const isLast = index === forecast.length - 1;

          return (
            <View
              key={item.date}
              style={[styles.row, !isLast && styles.rowBorder]}
            >
              {/* Day info */}
              <View style={styles.dayCol}>
                <Text style={styles.dayName}>{item.dayName}</Text>
                <Text style={styles.dayDate}>{item.formattedDate}</Text>
              </View>

              {/* Weather icon & condition */}
              <View style={styles.conditionCol}>
                <Ionicons
                  name={item.icon || 'sunny-outline'}
                  size={24}
                  color={THEME.colors.accent}
                />
                <Text style={styles.conditionName} numberOfLines={1}>
                  {item.condition}
                </Text>
              </View>

              {/* Min & Max Temp */}
              <View style={styles.tempCol}>
                <Text style={styles.maxTemp}>{formatTemp(item.maxTemp, unit)}</Text>
                <Text style={styles.minTemp}>{formatTemp(item.minTemp, unit)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: THEME.colors.cardBg,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  dayCol: {
    width: 80,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  dayDate: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  conditionCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  conditionName: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    flexShrink: 1,
  },
  tempCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: 86,
    justifyContent: 'flex-end',
  },
  maxTemp: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  minTemp: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
});
