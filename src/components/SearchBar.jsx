import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { searchCity } from '../services/weatherApi';

export default function SearchBar({ onSelectCity, isLoading }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const debounceTimer = useRef(null);

  // Debounced live suggestion fetching as user types
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        setIsSearchingSuggestions(true);
        const results = await searchCity(trimmed);
        setSuggestions(results.slice(0, 5));
        setShowDropdown(true);
      } catch (_) {
        setSuggestions([]);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setShowDropdown(false);

    if (suggestions.length > 0) {
      onSelectCity(suggestions[0]);
    } else {
      try {
        const results = await searchCity(trimmed);
        if (results.length > 0) {
          onSelectCity(results[0]);
        }
      } catch (e) {
        onSelectCity(null, e.message);
      }
    }
  };

  const handleSelectSuggestion = (cityItem) => {
    Keyboard.dismiss();
    setQuery(cityItem.name);
    setShowDropdown(false);
    onSelectCity(cityItem);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="search"
            size={20}
            color={THEME.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search city or state (e.g. Kerala, London)..."
            placeholderTextColor={THEME.colors.textMuted}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (!showDropdown) setShowDropdown(true);
            }}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCapitalize="words"
            autoCorrect={false}
          />
          {isSearchingSuggestions ? (
            <ActivityIndicator size="small" color={THEME.colors.accent} style={{ marginRight: 6 }} />
          ) : query.length > 0 ? (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.searchBtn, (!query.trim() || isLoading) && styles.searchBtnDisabled]}
          onPress={handleSubmit}
          disabled={!query.trim() || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Live Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((item, index) => {
            const isLast = index === suggestions.length - 1;
            const subtitle = [item.admin1, item.country].filter(Boolean).join(', ');

            return (
              <TouchableOpacity
                key={item.id || `${item.name}-${index}`}
                style={[styles.dropdownItem, !isLast && styles.dropdownBorder]}
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="location-outline" size={18} color={THEME.colors.accent} />
                <View style={styles.dropdownTextCol}>
                  <Text style={styles.suggestionCity} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {subtitle ? (
                    <Text style={styles.suggestionCountry} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.inputBg,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.inputBorder,
    paddingHorizontal: THEME.spacing.md,
    height: 50,
  },
  searchIcon: {
    marginRight: THEME.spacing.sm,
  },
  input: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 2,
  },
  searchBtn: {
    width: 50,
    height: 50,
    borderRadius: THEME.radius.lg,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBtnDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    elevation: 0,
  },
  dropdown: {
    marginHorizontal: THEME.spacing.md,
    backgroundColor: THEME.colors.cardBg,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: THEME.spacing.sm,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: THEME.spacing.md,
    gap: 10,
  },
  dropdownBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  dropdownTextCol: {
    flex: 1,
  },
  suggestionCity: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  suggestionCountry: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
});
