import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { formatTemp } from '../services/weatherApi';

export default function CurrentWeather({ city, weather, unit = 'C' }) {
  if (!weather || !city) return null;

  const current = weather.current;

  // Convert wind speed if unit is F (km/h to mph)
  const windDisplay =
    unit === 'F'
      ? `${Math.round(current.windSpeed * 0.621371)} mph`
      : `${current.windSpeed} km/h`;

  return (
    <View style={styles.card}>
      {/* City & Country */}
      <View style={styles.locationHeader}>
        <View style={styles.locationTitleRow}>
          <Ionicons name="location-outline" size={22} color={THEME.colors.accent} />
          <Text style={styles.cityName} numberOfLines={1}>
            {city.name}
          </Text>
        </View>
        <Text style={styles.countryName}>
          {[city.admin1, city.country].filter(Boolean).join(', ')}
        </Text>
      </View>

      {/* Main Condition & Temp Display */}
      <View style={styles.mainTempSection}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={current.icon || 'sunny-outline'}
            size={88}
            color={current.isDay === 0 ? '#E2E8F0' : '#FDE047'}
          />
        </View>

        <View style={styles.tempColumn}>
          <Text style={styles.tempText}>{formatTemp(current.temperature, unit)}</Text>
          <Text style={styles.conditionText}>{current.condition}</Text>
          <Text style={styles.feelsLikeText}>
            Feels like {formatTemp(current.feelsLike, unit)}
          </Text>
        </View>
      </View>

      {/* Weather Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* Humidity */}
        <View style={styles.metricItem}>
          <View style={[styles.metricIconBg, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
            <Ionicons name="water-outline" size={20} color={THEME.colors.accent} />
          </View>
          <View>
            <Text style={styles.metricLabel}>Humidity</Text>
            <Text style={styles.metricValue}>{current.humidity}%</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.gridDivider} />

        {/* Wind Speed */}
        <View style={styles.metricItem}>
          <View style={[styles.metricIconBg, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
            <Feather name="wind" size={20} color={THEME.colors.success} />
          </View>
          <View>
            <Text style={styles.metricLabel}>Wind Speed</Text>
            <Text style={styles.metricValue}>{windDisplay}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.cardBg,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.lg,
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  locationHeader: {
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cityName: {
    fontSize: 26,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: 0.3,
  },
  countryName: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  mainTempSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.sm,
    gap: THEME.spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempColumn: {
    alignItems: 'flex-start',
  },
  tempText: {
    fontSize: 56,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    lineHeight: 64,
  },
  conditionText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  feelsLikeText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  metricIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  gridDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
