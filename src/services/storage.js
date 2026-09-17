import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@weather_recent_searches_v1';
const UNIT_PREFERENCE_KEY = '@weather_unit_pref_v1';
const MAX_RECENT_ITEMS = 6;

/**
 * Loads recent searches from AsyncStorage.
 * @returns {Promise<Array>} Array of city objects
 */
export async function getRecentSearches() {
  try {
    const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to load recent searches from storage:', error);
    return [];
  }
}

/**
 * Adds or moves a city to the top of recent searches.
 * @param {Object} cityItem
 */
export async function saveRecentSearch(cityItem) {
  if (!cityItem || !cityItem.name) return [];
  try {
    const existing = await getRecentSearches();
    // Filter out if city already exists (case-insensitive name and country match)
    const filtered = existing.filter(
      (c) => !(c.name.toLowerCase() === cityItem.name.toLowerCase() && c.country === cityItem.country)
    );

    const updated = [
      {
        id: cityItem.id || `${cityItem.name}-${Date.now()}`,
        name: cityItem.name,
        country: cityItem.country,
        countryCode: cityItem.countryCode,
        latitude: cityItem.latitude,
        longitude: cityItem.longitude,
        admin1: cityItem.admin1,
      },
      ...filtered,
    ].slice(0, MAX_RECENT_ITEMS);

    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Failed to save recent search to storage:', error);
    return [];
  }
}

/**
 * Clears all recent searches from AsyncStorage.
 */
export async function clearRecentSearches() {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    return [];
  } catch (error) {
    console.warn('Failed to clear recent searches:', error);
    return [];
  }
}

/**
 * Loads saved temperature unit ('C' or 'F'). Defaults to 'C'.
 */
export async function getSavedUnit() {
  try {
    const unit = await AsyncStorage.getItem(UNIT_PREFERENCE_KEY);
    return unit === 'F' ? 'F' : 'C';
  } catch (_) {
    return 'C';
  }
}

/**
 * Persists user's temperature unit preference.
 */
export async function saveUnitPreference(unit) {
  try {
    await AsyncStorage.setItem(UNIT_PREFERENCE_KEY, unit);
  } catch (error) {
    console.warn('Failed to save unit preference:', error);
  }
}
