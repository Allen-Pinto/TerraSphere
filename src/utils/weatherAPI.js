// Weather API Configuration
const WEATHER_API_KEY = '0284819c70844362bd0163206252610';
const WEATHER_BASE_URL = 'https://api.weatherapi.com/v1/current.json';

// In-memory cache to minimize API calls
const weatherCache = {};

/**
 * Fetches current weather data for a given city
 * @param {string} cityName - Name of the city
 * @param {number} lat - Latitude (optional, for fallback)
 * @param {number} lon - Longitude (optional, for fallback)
 * @returns {Promise<Object|null>} Weather data or null if failed
 */
export async function fetchWeather(cityName, lat, lon) {
  const cacheKey = cityName.toLowerCase();
  
  // Return cached data if available
  if (weatherCache[cacheKey]) {
    console.log(`Using cached weather for ${cityName}`);
    return weatherCache[cacheKey];
  }

  try {
    console.log(`Fetching weather for ${cityName}...`);
    const response = await fetch(
      `${WEATHER_BASE_URL}?key=${WEATHER_API_KEY}&q=${cityName}&aqi=no`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.current) {
      // Format and cache the weather data
      const weatherData = {
        temp: Math.round(data.current.temp_c),
        humidity: data.current.humidity,
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        windSpeed: Math.round(data.current.wind_kph / 3.6), // Convert to m/s
        description: data.current.condition.text.toLowerCase()
      };
      
      weatherCache[cacheKey] = weatherData;
      return weatherData;
    }
  } catch (error) {
    console.error(`Weather fetch error for ${cityName}:`, error);
    return null;
  }
  
  return null;
}

/**
 * Get color based on temperature value
 * @param {number} temp - Temperature in Celsius
 * @returns {string} Hex color code
 */
export function getColorForTemp(temp) {
  if (temp < 10) return '#4DA6FF';  // Blue (cold)
  if (temp < 20) return '#66CC66';  // Green (mild)
  if (temp < 30) return '#FF9933';  // Orange (warm)
  return '#FF4C4C';                 // Red (hot)
}

/**
 * Clear the weather cache (useful for refresh)
 */
export function clearWeatherCache() {
  Object.keys(weatherCache).forEach(key => delete weatherCache[key]);
  console.log('Weather cache cleared');
}

/**
 * Get cached weather data without making API call
 * @param {string} cityName - Name of the city
 * @returns {Object|null} Cached weather data or null
 */
export function getCachedWeather(cityName) {
  return weatherCache[cityName.toLowerCase()] || null;
}