const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Maps WMO weather codes to human-readable condition text, Ionicons icon name, and theme category.
 */
export function getWeatherDetails(code, isDay = 1) {
  switch (code) {
    case 0:
      return {
        condition: isDay ? 'Clear Sky' : 'Clear Night',
        icon: isDay ? 'sunny-outline' : 'moon-outline',
        gradientKey: isDay ? 'clearSkyDay' : 'clearSkyNight',
      };
    case 1:
      return {
        condition: 'Mainly Clear',
        icon: isDay ? 'sunny-outline' : 'moon-outline',
        gradientKey: isDay ? 'clearSkyDay' : 'clearSkyNight',
      };
    case 2:
      return {
        condition: 'Partly Cloudy',
        icon: isDay ? 'partly-sunny-outline' : 'cloudy-night-outline',
        gradientKey: 'cloudy',
      };
    case 3:
      return {
        condition: 'Overcast',
        icon: 'cloudy-outline',
        gradientKey: 'cloudy',
      };
    case 45:
    case 48:
      return {
        condition: 'Foggy',
        icon: 'cloud-outline',
        gradientKey: 'cloudy',
      };
    case 51:
    case 53:
    case 55:
      return {
        condition: 'Drizzle',
        icon: 'rainy-outline',
        gradientKey: 'rainy',
      };
    case 56:
    case 57:
      return {
        condition: 'Freezing Drizzle',
        icon: 'snow-outline',
        gradientKey: 'snowy',
      };
    case 61:
    case 63:
      return {
        condition: 'Rain',
        icon: 'rainy',
        gradientKey: 'rainy',
      };
    case 65:
      return {
        condition: 'Heavy Rain',
        icon: 'thunderstorm-outline',
        gradientKey: 'rainy',
      };
    case 66:
    case 67:
      return {
        condition: 'Freezing Rain',
        icon: 'snow-outline',
        gradientKey: 'snowy',
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        condition: 'Snow',
        icon: 'snow',
        gradientKey: 'snowy',
      };
    case 80:
    case 81:
    case 82:
      return {
        condition: 'Rain Showers',
        icon: 'rainy-outline',
        gradientKey: 'rainy',
      };
    case 85:
    case 86:
      return {
        condition: 'Snow Showers',
        icon: 'snow-outline',
        gradientKey: 'snowy',
      };
    case 95:
    case 96:
    case 99:
      return {
        condition: 'Thunderstorm',
        icon: 'thunderstorm',
        gradientKey: 'thunderstorm',
      };
    default:
      return {
        condition: 'Partly Cloudy',
        icon: 'partly-sunny-outline',
        gradientKey: 'cloudy',
      };
  }
}

/**
 * Searches for cities matching a query string using Open-Meteo Geocoding.
 */
export async function searchCity(query) {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) {
    throw new Error('Please enter at least 2 characters to search.');
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Location search failed (Status: ${response.status})`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error(`No city found matching "${trimmed}". Please check the spelling.`);
    }

    return data.results.map((item) => ({
      id: `${item.id}-${item.name}-${item.country_code}`,
      name: item.name,
      admin1: item.admin1 || '',
      country: item.country || '',
      countryCode: item.country_code || '',
      latitude: item.latitude,
      longitude: item.longitude,
    }));
  } catch (error) {
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw error;
  }
}

/**
 * Fetches current weather and 7-day daily forecast for given coordinates.
 */
export async function fetchWeather(latitude, longitude) {
  const url = `${FORECAST_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather fetch failed (Status: ${response.status})`);
    }

    const data = await response.json();
    if (!data.current || !data.daily) {
      throw new Error('Incomplete weather data received from server.');
    }

    const currentDetails = getWeatherDetails(data.current.weather_code, data.current.is_day);

    const dailyForecast = (data.daily.time || []).map((dateStr, index) => {
      const code = data.daily.weather_code?.[index] ?? 0;
      const details = getWeatherDetails(code, 1);
      
      const date = new Date(dateStr);
      const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        date: dateStr,
        dayName,
        formattedDate,
        code,
        condition: details.condition,
        icon: details.icon,
        maxTemp: data.daily.temperature_2m_max?.[index] ?? 0,
        minTemp: data.daily.temperature_2m_min?.[index] ?? 0,
      };
    });

    return {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day,
        condition: currentDetails.condition,
        icon: currentDetails.icon,
        gradientKey: currentDetails.gradientKey,
      },
      forecast: dailyForecast,
      timezone: data.timezone,
    };
  } catch (error) {
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      throw new Error('Unable to connect to weather server. Check your network.');
    }
    throw error;
  }
}

/**
 * Reverse geocoding fallback for current GPS coordinates.
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return {
        name: data.city || data.locality || data.principalSubdivision || 'Current Location',
        country: data.countryName || '',
        countryCode: data.countryCode || '',
        admin1: data.principalSubdivision || '',
      };
    }
  } catch (_) {
    // Fallback if reverse geocode service fails
  }
  return {
    name: 'Current Location',
    country: '',
    countryCode: '',
    admin1: '',
  };
}

/**
 * Temperature converter helper
 */
export function formatTemp(tempC, unit = 'C') {
  if (tempC === null || tempC === undefined) return '--';
  if (unit === 'F') {
    return `${Math.round((tempC * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(tempC)}°C`;
}
