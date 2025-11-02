// Weather Service - Real API Integration
export interface WeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  city: string
  country: string
  icon: string
  airQuality?: {
    aqi: number
    pm25: number
    pm10: number
    level: string
  }
}

export interface LocationData {
  lat: number
  lon: number
  city: string
  state: string
  country: string
}

class WeatherService {
  private readonly OPEN_METEO_BASE = 'https://api.open-meteo.com/v1'
  private readonly AQI_BASE = 'https://api.waqi.info/feed'

  // Get coordinates from PIN code using a geocoding service
  async getCoordinatesFromPincode(pincode: string): Promise<LocationData> {
    try {
      // Using a free geocoding service for Indian PIN codes
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      
      if (!response.ok) {
        console.log('Geocoding service unavailable, using default location')
        return this.getDefaultLocation()
      }
      
      const data = await response.json()
      
      if (data.Status === 'Success' && data.PostOffice && data.PostOffice.length > 0) {
        const postOffice = data.PostOffice[0]
        // For demo purposes, using approximate coordinates
        // In production, you'd use a proper geocoding service
        const coordinates = this.getApproximateCoordinates(postOffice.State, postOffice.District)
        
        return {
          lat: coordinates.lat,
          lon: coordinates.lon,
          city: postOffice.District,
          state: postOffice.State,
          country: 'India'
        }
      }
      
      console.log('Invalid PIN code response, using default location')
      return this.getDefaultLocation()
    } catch (error) {
      console.log('Geocoding error, using default location:', error)
      return this.getDefaultLocation()
    }
  }

  private getDefaultLocation(): LocationData {
    return {
      lat: 16.3067,
      lon: 80.4365,
      city: 'Guntur',
      state: 'Andhra Pradesh',
      country: 'India'
    }
  }

  // Get coordinates from city name using free geocoding
  async getCoordinatesFromCity(cityName: string): Promise<LocationData> {
    try {
      // Using free Nominatim geocoding service
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`)
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable')
      }
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        return {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          city: result.display_name.split(',')[0],
          state: result.display_name.split(',')[1]?.trim() || 'Unknown',
          country: result.display_name.split(',').pop()?.trim() || 'Unknown'
        }
      }
      
      throw new Error('City not found')
    } catch (error) {
      console.log('City geocoding error, using default location:', error)
      return this.getDefaultLocation()
    }
  }

  // Reverse geocoding: Get city name from coordinates
  async getCityFromCoordinates(lat: number, lon: number): Promise<LocationData> {
    try {
      // Using free Nominatim reverse geocoding service
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`)
      
      if (!response.ok) {
        throw new Error('Reverse geocoding service unavailable')
      }
      
      const data = await response.json()
      
      if (data && data.address) {
        const address = data.address
        return {
          lat: lat,
          lon: lon,
          city: address.city || address.town || address.village || address.county || 'Current Location',
          state: address.state || address.region || 'Unknown',
          country: address.country || 'Unknown'
        }
      }
      
      // Fallback if reverse geocoding fails
      return {
        lat: lat,
        lon: lon,
        city: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        state: 'Unknown',
        country: 'Unknown'
      }
    } catch (error) {
      console.log('Reverse geocoding error:', error)
      // Return coordinates if reverse geocoding fails
      return {
        lat: lat,
        lon: lon,
        city: `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        state: 'Unknown',
        country: 'Unknown'
      }
    }
  }

  // Get weather data from Open-Meteo (Free API)
  async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`
      )
      
      const data = await response.json()
      
      if (!data.current_weather) {
        throw new Error('Weather data not available')
      }

      const current = data.current_weather
      const hourly = data.hourly

      return {
        temperature: Math.round(current.temperature),
        description: this.getWeatherDescription(current.weathercode),
        humidity: Math.round(hourly.relative_humidity_2m[0] || 0),
        windSpeed: Math.round(current.windspeed * 3.6), // Convert m/s to km/h
        city: 'Current Location',
        country: 'India',
        icon: this.getWeatherIcon(current.weathercode)
      }
    } catch (error) {
      console.error('Weather API error:', error)
      throw new Error('Unable to fetch weather data')
    }
  }

  // Get air quality data
  async getAirQualityData(lat: number, lon: number): Promise<WeatherData['airQuality']> {
    try {
      // Using a free air quality API
      const response = await fetch(`${this.AQI_BASE}/geo:${lat};${lon}/?token=demo`)
      
      if (!response.ok) {
        throw new Error('Air quality API not available')
      }
      
      const data = await response.json()
      
      if (!data || !data.data) {
        throw new Error('Invalid air quality data')
      }
      
      return {
        aqi: data.data.aqi || 50,
        pm25: data.data.iaqi?.pm25?.v || 25,
        pm10: data.data.iaqi?.pm10?.v || 40,
        level: this.getAQILevel(data.data.aqi || 50)
      }
    } catch (error) {
      console.log('Air quality API error:', error)
      throw new Error('Unable to fetch air quality data')
    }
  }



  // Helper methods
  private getApproximateCoordinates(state: string, _district: string): {lat: number, lon: number} {
    // Approximate coordinates for major Indian cities
    const coordinates: {[key: string]: {lat: number, lon: number}} = {
      'Andhra Pradesh': { lat: 16.3067, lon: 80.4365 },
      'Delhi': { lat: 28.6139, lon: 77.2090 },
      'Maharashtra': { lat: 19.0760, lon: 72.8777 },
      'Karnataka': { lat: 12.9716, lon: 77.5946 },
      'Tamil Nadu': { lat: 13.0827, lon: 80.2707 },
      'Gujarat': { lat: 23.0225, lon: 72.5714 },
      'Rajasthan': { lat: 26.9124, lon: 75.7873 },
      'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
      'West Bengal': { lat: 22.5726, lon: 88.3639 },
      'Kerala': { lat: 10.8505, lon: 76.2711 }
    }
    
    return coordinates[state] || coordinates['Andhra Pradesh']
  }

  private getWeatherDescription(weatherCode: number): string {
    const descriptions: {[key: number]: string} = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Heavy thunderstorm with hail'
    }
    
    return descriptions[weatherCode] || 'Unknown'
  }

  private getWeatherIcon(weatherCode: number): string {
    if (weatherCode <= 2) return 'c' // Clear
    if (weatherCode <= 3) return 'lc' // Light cloud
    if (weatherCode <= 48) return 'hc' // Heavy cloud
    if (weatherCode <= 55) return 'lr' // Light rain
    if (weatherCode <= 65) return 'hr' // Heavy rain
    if (weatherCode <= 75) return 'sn' // Snow
    if (weatherCode <= 99) return 't' // Thunderstorm
    return 'c'
  }

  private getAQILevel(aqi: number): string {
    if (aqi <= 50) return 'Good'
    if (aqi <= 100) return 'Moderate'
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
    if (aqi <= 200) return 'Unhealthy'
    if (aqi <= 300) return 'Very Unhealthy'
    return 'Hazardous'
  }


}

export const weatherService = new WeatherService()
