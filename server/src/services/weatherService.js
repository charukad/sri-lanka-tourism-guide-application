const axios = require("axios");
const config = require("../config");

/**
 * Get current weather for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - Weather data
 */
exports.getCurrentWeather = async (lat, lng) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat,
          lon: lng,
          appid: config.weatherApiKey,
          units: "metric",
        },
      }
    );

    return {
      location: response.data.name,
      weather: {
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        temperature: response.data.main.temp,
        feels_like: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        wind_speed: response.data.wind.speed,
      },
    };
  } catch (error) {
    console.error("Weather API error:", error.message);
    throw new Error("Unable to fetch current weather data");
  }
};

/**
 * Get weather forecast for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} days - Number of days (1-7)
 * @returns {Promise<Object>} - Forecast data
 */
exports.getWeatherForecast = async (lat, lng, days = 7) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/onecall",
      {
        params: {
          lat,
          lon: lng,
          exclude: "minutely,hourly",
          appid: config.weatherApiKey,
          units: "metric",
        },
      }
    );

    const forecastDays = response.data.daily.slice(0, days).map((day) => ({
      date: new Date(day.dt * 1000),
      weather: {
        description: day.weather[0].description,
        icon: day.weather[0].icon,
        temperature: {
          min: day.temp.min,
          max: day.temp.max,
          day: day.temp.day,
        },
        humidity: day.humidity,
        wind_speed: day.wind_speed,
        precipitation: day.pop,
        uvi: day.uvi,
      },
    }));

    return {
      current: {
        temperature: response.data.current.temp,
        feels_like: response.data.current.feels_like,
        humidity: response.data.current.humidity,
        wind_speed: response.data.current.wind_speed,
        description: response.data.current.weather[0].description,
        icon: response.data.current.weather[0].icon,
      },
      forecast: forecastDays,
    };
  } catch (error) {
    console.error("Weather forecast API error:", error.message);
    throw new Error("Unable to fetch weather forecast data");
  }
};

/**
 * Check for weather alerts in a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Array>} - Weather alerts
 */
exports.getWeatherAlerts = async (lat, lng) => {
  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/onecall",
      {
        params: {
          lat,
          lon: lng,
          exclude: "minutely,hourly,daily",
          appid: config.weatherApiKey,
          units: "metric",
        },
      }
    );

    // If alerts exist, format them
    if (response.data.alerts && response.data.alerts.length > 0) {
      return response.data.alerts.map((alert) => ({
        sender: alert.sender_name,
        event: alert.event,
        start: new Date(alert.start * 1000),
        end: new Date(alert.end * 1000),
        description: alert.description,
        severity: getSeverityLevel(alert.event),
      }));
    }

    return [];
  } catch (error) {
    console.error("Weather alerts API error:", error.message);
    throw new Error("Unable to fetch weather alerts");
  }
};

/**
 * Determine severity level of weather event
 * @param {string} eventType - Type of weather event
 * @returns {string} - Severity level (high, medium, low)
 */
const getSeverityLevel = (eventType) => {
  const highSeverity = [
    "Hurricane",
    "Tornado",
    "Tsunami",
    "Flood",
    "Typhoon",
    "Cyclone",
  ];
  const mediumSeverity = [
    "Thunderstorm",
    "Storm",
    "Heavy Rain",
    "Heavy Snow",
    "Hail",
    "Extreme",
  ];

  const normalizedEvent = eventType.toLowerCase();

  for (const event of highSeverity) {
    if (normalizedEvent.includes(event.toLowerCase())) {
      return "high";
    }
  }

  for (const event of mediumSeverity) {
    if (normalizedEvent.includes(event.toLowerCase())) {
      return "medium";
    }
  }

  return "low";
};
