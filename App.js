import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { THEME } from './src/constants/theme';
import { searchCity, fetchWeather, reverseGeocode } from './src/services/weatherApi';
import {
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  getSavedUnit,
  saveUnitPreference,
} from './src/services/storage';

import SearchBar from './src/components/SearchBar';
import RecentSearches from './src/components/RecentSearches';
import CurrentWeather from './src/components/CurrentWeather';
import ForecastList from './src/components/ForecastList';
import LoadingView from './src/components/LoadingView';
import ErrorView from './src/components/ErrorView';

const DEFAULT_CITY = {
  name: 'London',
  country: 'United Kingdom',
  countryCode: 'GB',
  latitude: 51.5085,
  longitude: -0.1257,
};

export default function App() {
  const [currentCity, setCurrentCity] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [unit, setUnit] = useState('C'); // 'C' or 'F'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null); // for retry

  // Initial setup: Load preferences, recent searches, and initial weather
  useEffect(() => {
    async function initializeApp() {
      try {
        const [savedUnit, savedRecent] = await Promise.all([
          getSavedUnit(),
          getRecentSearches(),
        ]);

        setUnit(savedUnit);
        setRecentSearches(savedRecent);

        // If there is a recent search, load the latest one; otherwise use DEFAULT_CITY
        const initialCity = savedRecent.length > 0 ? savedRecent[0] : DEFAULT_CITY;
        await loadWeatherForCity(initialCity);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize app.');
        setLoading(false);
      }
    }

    initializeApp();
  }, []);

  // Fetch weather for a given city object
  const loadWeatherForCity = useCallback(async (cityObj) => {
    setError(null);
    setLoading(true);
    setLastAction(() => () => loadWeatherForCity(cityObj));

    try {
      const data = await fetchWeather(cityObj.latitude, cityObj.longitude);
      setCurrentCity(cityObj);
      setWeatherData(data);

      // Save to recent searches
      const updated = await saveRecentSearch(cityObj);
      setRecentSearches(updated);
    } catch (err) {
      setError(err.message || 'Could not fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search by city name string
  const handleSearchCityName = useCallback(async (cityName) => {
    setError(null);
    setLoading(true);
    setLastAction(() => () => handleSearchCityName(cityName));

    try {
      const results = await searchCity(cityName);
      const chosenCity = results[0];
      await loadWeatherForCity(chosenCity);
    } catch (err) {
      setError(err.message || `No results found for "${cityName}".`);
      setLoading(false);
    }
  }, [loadWeatherForCity]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    if (!currentCity) return;
    setRefreshing(true);
    try {
      const data = await fetchWeather(currentCity.latitude, currentCity.longitude);
      setWeatherData(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to refresh weather.');
    } finally {
      setRefreshing(false);
    }
  }, [currentCity]);

  // Toggle temperature unit (°C / °F)
  const toggleUnit = useCallback(async () => {
    const nextUnit = unit === 'C' ? 'F' : 'C';
    setUnit(nextUnit);
    await saveUnitPreference(nextUnit);
  }, [unit]);

  // Clear recent searches
  const handleClearRecent = useCallback(async () => {
    const cleared = await clearRecentSearches();
    setRecentSearches(cleared);
  }, []);

  // Fetch current GPS location weather
  const handleUseCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to detect your local weather. You can still search for any city manually.'
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const reverseDetails = await reverseGeocode(latitude, longitude);

      const locationCity = {
        name: reverseDetails.name,
        country: reverseDetails.country,
        countryCode: reverseDetails.countryCode,
        admin1: reverseDetails.admin1,
        latitude,
        longitude,
      };

      await loadWeatherForCity(locationCity);
    } catch (err) {
      setError('Unable to fetch device location. Please ensure GPS is enabled.');
      setLoading(false);
    }
  }, [loadWeatherForCity]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Ionicons name="cloud-done-outline" size={26} color={THEME.colors.accent} />
          <Text style={styles.logoText}>WeatherCast</Text>
        </View>

        <View style={styles.headerActions}>
          {/* GPS Location Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleUseCurrentLocation}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Use current GPS location"
          >
            <Ionicons name="navigate-outline" size={20} color={THEME.colors.textPrimary} />
          </TouchableOpacity>

          {/* Unit Toggle Button */}
          <TouchableOpacity
            style={styles.unitToggle}
            onPress={toggleUnit}
            activeOpacity={0.8}
            accessibilityLabel="Toggle Celsius or Fahrenheit"
          >
            <Text style={[styles.unitText, unit === 'C' && styles.unitActive]}>°C</Text>
            <Text style={styles.unitDivider}>|</Text>
            <Text style={[styles.unitText, unit === 'F' && styles.unitActive]}>°F</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      <SearchBar onSearch={handleSearchCityName} isLoading={loading && !refreshing} />

      {/* Recent Searches Pills */}
      <RecentSearches
        searches={recentSearches}
        onSelectCity={loadWeatherForCity}
        onClear={handleClearRecent}
        activeCityName={currentCity?.name}
      />

      {/* Main Scrollable View with Pull-to-refresh */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={THEME.colors.accent}
            colors={[THEME.colors.primary]}
          />
        }
      >
        {/* Error State */}
        {error ? (
          <ErrorView
            message={error}
            onRetry={() => {
              if (lastAction) lastAction();
            }}
          />
        ) : loading && !refreshing && !weatherData ? (
          /* Loading State */
          <LoadingView message="Getting weather forecast..." />
        ) : (
          /* Weather Content */
          <>
            <CurrentWeather city={currentCity} weather={weatherData} unit={unit} />
            <ForecastList forecast={weatherData?.forecast} unit={unit} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBg,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  unitActive: {
    color: THEME.colors.accent,
    fontWeight: '800',
  },
  unitDivider: {
    color: THEME.colors.cardBorder,
    fontSize: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: THEME.spacing.xl,
  },
});
