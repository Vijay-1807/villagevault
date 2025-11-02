const axios = require('axios')

class WeatherService {
  constructor() {
    this.baseUrl = 'https://api.open-meteo.com/v1'
  }

  /**
   * Get current weather forecast
   */
  async getCurrentWeather(latitude, longitude, days = 7) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: latitude,
          longitude: longitude,
          current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
          hourly: 'temperature_2m,precipitation,weather_code',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
          timezone: 'auto',
          forecast_days: days
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching weather:', error.response?.data || error.message)
      throw new Error('Failed to fetch weather data')
    }
  }

  /**
   * Get agricultural weather forecast (crop-specific)
   */
  async getAgriculturalWeather(latitude, longitude, days = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: latitude,
          longitude: longitude,
          current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,soil_temperature_0cm,soil_moisture_0_1cm',
          hourly: 'temperature_2m,relative_humidity_2m,precipitation,soil_temperature_0cm,soil_moisture_0_1cm',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max',
          timezone: 'auto',
          forecast_days: days
        }
      })
      
      const weatherData = response.data
      
      // Enhance with agricultural insights
      return {
        ...weatherData,
        agricultural: {
          cropAdvice: this.getCropAdvice(weatherData),
          farmingTips: this.getFarmingTips(weatherData),
          alerts: this.getAgriculturalAlerts(weatherData)
        }
      }
    } catch (error) {
      console.error('Error fetching agricultural weather:', error.response?.data || error.message)
      throw new Error('Failed to fetch agricultural weather data')
    }
  }

  /**
   * Get crop-specific advice based on weather
   */
  getCropAdvice(weatherData) {
    const advice = []
    const currentTemp = weatherData.current?.temperature_2m || 0
    const precipitation = weatherData.daily?.precipitation_sum?.[0] || 0
    const humidity = weatherData.current?.relative_humidity_2m || 0

    // Temperature-based advice
    if (currentTemp > 35) {
      advice.push({
        type: 'warning',
        title: 'High Temperature Alert',
        message: 'Temperatures are very high. Consider irrigating crops in early morning or evening.',
        crops: ['All crops']
      })
    } else if (currentTemp < 10) {
      advice.push({
        type: 'info',
        title: 'Low Temperature Alert',
        message: 'Temperatures are low. Protect sensitive crops with covers or move them indoors.',
        crops: ['Vegetables', 'Fruits']
      })
    }

    // Precipitation-based advice
    if (precipitation > 20) {
      advice.push({
        type: 'warning',
        title: 'Heavy Rainfall Expected',
        message: 'Heavy rainfall expected. Ensure proper drainage and protect crops from waterlogging.',
        crops: ['All crops']
      })
    } else if (precipitation === 0 && humidity < 40) {
      advice.push({
        type: 'info',
        title: 'Dry Conditions',
        message: 'Low humidity and no rainfall. Increase irrigation frequency.',
        crops: ['All crops']
      })
    }

    // Optimal conditions
    if (currentTemp >= 20 && currentTemp <= 30 && precipitation > 0 && precipitation < 10) {
      advice.push({
        type: 'success',
        title: 'Optimal Weather Conditions',
        message: 'Weather conditions are optimal for most crops. Good time for planting and growth.',
        crops: ['Rice', 'Wheat', 'Vegetables', 'Pulses']
      })
    }

    return advice
  }

  /**
   * Get farming tips based on weather
   */
  getFarmingTips(weatherData) {
    const tips = []
    const currentTemp = weatherData.current?.temperature_2m || 0
    const precipitation = weatherData.daily?.precipitation_sum?.[0] || 0
    const uvIndex = weatherData.daily?.uv_index_max?.[0] || 0

    if (precipitation > 10) {
      tips.push({
        title: 'Rainy Day Farming',
        description: 'Avoid harvesting on rainy days. Use this time for planning and maintenance work.',
        icon: '🌧️'
      })
    }

    if (uvIndex > 8) {
      tips.push({
        title: 'High UV Index',
        description: 'Protect yourself from sun exposure. Work in early morning or evening hours.',
        icon: '☀️'
      })
    }

    if (currentTemp >= 25 && currentTemp <= 32) {
      tips.push({
        title: 'Good Planting Weather',
        description: 'Ideal temperature for planting most crops. Prepare soil and start planting.',
        icon: '🌱'
      })
    }

    if (precipitation === 0 && currentTemp > 25) {
      tips.push({
        title: 'Irrigation Needed',
        description: 'No rainfall expected. Schedule irrigation to maintain soil moisture.',
        icon: '💧'
      })
    }

    return tips
  }

  /**
   * Get agricultural alerts
   */
  getAgriculturalAlerts(weatherData) {
    const alerts = []
    const maxTemp = weatherData.daily?.temperature_2m_max?.[0] || 0
    const minTemp = weatherData.daily?.temperature_2m_min?.[0] || 0
    const precipitation = weatherData.daily?.precipitation_sum?.[0] || 0
    const windSpeed = weatherData.daily?.wind_speed_10m_max?.[0] || 0

    if (maxTemp > 40) {
      alerts.push({
        severity: 'high',
        type: 'extreme_heat',
        title: 'Extreme Heat Warning',
        message: 'Extreme heat expected. Crops may suffer heat stress. Increase irrigation.',
        action: 'irrigate_more'
      })
    }

    if (minTemp < 5) {
      alerts.push({
        severity: 'high',
        type: 'frost',
        title: 'Frost Alert',
        message: 'Risk of frost. Protect sensitive crops.',
        action: 'protect_crops'
      })
    }

    if (precipitation > 50) {
      alerts.push({
        severity: 'high',
        type: 'heavy_rain',
        title: 'Heavy Rainfall Warning',
        message: 'Heavy rainfall expected. Ensure drainage systems are working.',
        action: 'check_drainage'
      })
    }

    if (windSpeed > 20) {
      alerts.push({
        severity: 'medium',
        type: 'strong_wind',
        title: 'Strong Wind Alert',
        message: 'Strong winds expected. Secure equipment and check for damage.',
        action: 'secure_equipment'
      })
    }

    return alerts
  }

  /**
   * Get weather code description
   */
  getWeatherCodeDescription(code) {
    const weatherCodes = {
      0: { description: 'Clear sky', icon: '☀️' },
      1: { description: 'Mainly clear', icon: '🌤️' },
      2: { description: 'Partly cloudy', icon: '⛅' },
      3: { description: 'Overcast', icon: '☁️' },
      45: { description: 'Foggy', icon: '🌫️' },
      48: { description: 'Depositing rime fog', icon: '🌫️' },
      51: { description: 'Light drizzle', icon: '🌦️' },
      53: { description: 'Moderate drizzle', icon: '🌦️' },
      55: { description: 'Dense drizzle', icon: '🌦️' },
      56: { description: 'Light freezing drizzle', icon: '🌨️' },
      57: { description: 'Dense freezing drizzle', icon: '🌨️' },
      61: { description: 'Slight rain', icon: '🌧️' },
      63: { description: 'Moderate rain', icon: '🌧️' },
      65: { description: 'Heavy rain', icon: '🌧️' },
      66: { description: 'Light freezing rain', icon: '🌨️' },
      67: { description: 'Heavy freezing rain', icon: '🌨️' },
      71: { description: 'Slight snow fall', icon: '❄️' },
      73: { description: 'Moderate snow fall', icon: '❄️' },
      75: { description: 'Heavy snow fall', icon: '❄️' },
      77: { description: 'Snow grains', icon: '❄️' },
      80: { description: 'Slight rain showers', icon: '🌦️' },
      81: { description: 'Moderate rain showers', icon: '🌦️' },
      82: { description: 'Violent rain showers', icon: '🌧️' },
      85: { description: 'Slight snow showers', icon: '🌨️' },
      86: { description: 'Heavy snow showers', icon: '🌨️' },
      95: { description: 'Thunderstorm', icon: '⛈️' },
      96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
      99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' }
    }
    
    return weatherCodes[code] || { description: 'Unknown', icon: '🌤️' }
  }
}

module.exports = new WeatherService()

