import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../services/api'
import { weatherService } from '../services/weatherService'
import { 
  Cloud, 
  Sun, 
  Thermometer, 
  AlertTriangle, 
  Info,
  Loader2,
  MapPin,
  Calendar,
  TrendingUp,
  Sprout,
  Search,
  Navigation,
  Globe
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

interface WeatherData {
  current?: {
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m?: number
  }
  hourly?: {
    wind_speed_10m?: number[]
    [key: string]: any
  }
  daily?: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    wind_speed_10m_max: number[]
    weather_code: number[]
    uv_index_max?: number[]
  }
  agricultural?: {
    cropAdvice: Array<{
      type: 'warning' | 'info' | 'success'
      title: string
      message: string
      crops: string[]
    }>
    farmingTips: Array<{
      title: string
      description: string
      icon: string
    }>
    alerts: Array<{
      severity: 'high' | 'medium' | 'low'
      type: string
      title: string
      message: string
      action: string
    }>
  }
}

type LocationInputType = 'pincode' | 'city' | 'coordinates' | 'auto'

const EnhancedWeather = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [location, setLocation] = useState<{lat: number, lon: number, city: string, state?: string} | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [forecastDays] = useState(10)
  
  // Location input state
  const [inputType, setInputType] = useState<LocationInputType>('auto')
  const [pincodeInput, setPincodeInput] = useState('')
  const [cityInput, setCityInput] = useState('')
  const [latInput, setLatInput] = useState('')
  const [lonInput, setLonInput] = useState('')

  useEffect(() => {
    // Priority 1: Try geolocation first
    handleAutoLocation()
    
    // If user has PIN code, set it as fallback option but don't use it automatically
    if (user?.pinCode) {
      setPincodeInput(user.pinCode)
    }
  }, [user])

  const handleAutoLocation = async () => {
    setInputType('auto')
    setLoading(true)
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            // Get city name from coordinates using reverse geocoding
            try {
              const locationData = await weatherService.getCityFromCoordinates(latitude, longitude)
              setLocation(locationData)
              await fetchAgriculturalWeather(latitude, longitude)
            } catch (error) {
              // If reverse geocoding fails, still use coordinates
              setLocation({
                lat: latitude,
                lon: longitude,
                city: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
              })
              await fetchAgriculturalWeather(latitude, longitude)
            }
            setLoading(false)
          },
          async (error) => {
            console.log('Geolocation error:', error)
            // Fallback priority: PIN code > Default location
            if (user?.pinCode) {
              // Try PIN code as fallback
              setInputType('pincode')
              try {
                const locationData = await weatherService.getCoordinatesFromPincode(user.pinCode)
                setLocation(locationData)
                await fetchAgriculturalWeather(locationData.lat, locationData.lon)
              } catch (pincodeError) {
                // If PIN code fails, use default location
                const defaultLocation = { lat: 16.3067, lon: 80.4365, city: 'Guntur', state: 'Andhra Pradesh' }
                setLocation(defaultLocation)
                await fetchAgriculturalWeather(defaultLocation.lat, defaultLocation.lon)
              }
            } else {
              // No PIN code, use default location
              const defaultLocation = { lat: 16.3067, lon: 80.4365, city: 'Guntur', state: 'Andhra Pradesh' }
              setLocation(defaultLocation)
              await fetchAgriculturalWeather(defaultLocation.lat, defaultLocation.lon)
            }
            setLoading(false)
          }
        )
      } else {
        // Geolocation not supported, use fallback
        if (user?.pinCode) {
          setInputType('pincode')
          try {
            const locationData = await weatherService.getCoordinatesFromPincode(user.pinCode)
            setLocation(locationData)
            await fetchAgriculturalWeather(locationData.lat, locationData.lon)
          } catch (pincodeError) {
            const defaultLocation = { lat: 16.3067, lon: 80.4365, city: 'Guntur', state: 'Andhra Pradesh' }
            setLocation(defaultLocation)
            await fetchAgriculturalWeather(defaultLocation.lat, defaultLocation.lon)
          }
        } else {
          const defaultLocation = { lat: 16.3067, lon: 80.4365, city: 'Guntur', state: 'Andhra Pradesh' }
          setLocation(defaultLocation)
          await fetchAgriculturalWeather(defaultLocation.lat, defaultLocation.lon)
        }
        setLoading(false)
      }
    } catch (error) {
      console.error('Error getting location:', error)
      // Final fallback
      if (user?.pinCode) {
        setInputType('pincode')
        try {
          const locationData = await weatherService.getCoordinatesFromPincode(user.pinCode)
          setLocation(locationData)
          await fetchAgriculturalWeather(locationData.lat, locationData.lon)
        } catch (pincodeError) {
          const defaultLocation = { lat: 16.3067, lon: 80.4365, city: 'Guntur', state: 'Andhra Pradesh' }
          setLocation(defaultLocation)
          await fetchAgriculturalWeather(defaultLocation.lat, defaultLocation.lon)
        }
      } else {
        const defaultLocation = { lat: 16.3067, lon: 80.4365, city: 'Guntur', state: 'Andhra Pradesh' }
        setLocation(defaultLocation)
        await fetchAgriculturalWeather(defaultLocation.lat, defaultLocation.lon)
      }
      setLoading(false)
    }
  }

  const handleLocationSearch = async (type: LocationInputType, value?: string) => {
    setSearching(true)
    setLoading(true)
    try {
      let locationData: {lat: number, lon: number, city: string, state?: string}

      if (type === 'pincode') {
        const pincode = value || pincodeInput
        if (!pincode || pincode.length < 6) {
          toast.error(t('weather.pleaseEnterValidPincode'))
          setSearching(false)
          setLoading(false)
          return
        }
        locationData = await weatherService.getCoordinatesFromPincode(pincode)
      } else if (type === 'city') {
        const city = value || cityInput
        if (!city || city.trim().length < 2) {
          toast.error(t('weather.pleaseEnterValidCity'))
          setSearching(false)
          setLoading(false)
          return
        }
        locationData = await weatherService.getCoordinatesFromCity(city)
      } else if (type === 'coordinates') {
        const lat = parseFloat(latInput)
        const lon = parseFloat(lonInput)
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          toast.error(t('weather.pleaseEnterValidCoordinates'))
          setSearching(false)
          setLoading(false)
          return
        }
        locationData = {
          lat,
          lon,
          city: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
        }
      } else {
        // Auto location
        await handleAutoLocation()
        return
      }

      setLocation(locationData)
      await fetchAgriculturalWeather(locationData.lat, locationData.lon)
      toast.success(`${t('weather.loadedFor')} ${locationData.city}`)
    } catch (error: any) {
      console.error('Error searching location:', error)
      toast.error(error.message || t('weather.failedToGetLocation'))
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }

  const fetchAgriculturalWeather = async (lat: number, lon: number) => {
    try {
      const response = await api.get('/weather/agricultural', {
        params: {
          latitude: lat,
          longitude: lon,
          days: forecastDays
        }
      })
      setWeatherData(response.data)
    } catch (error: any) {
      console.error('Error fetching weather:', error)
      toast.error(error.response?.data?.error || t('weather.failedToFetch'))
    }
  }

  const getWeatherIcon = (code: number) => {
    const icons: {[key: number]: string} = {
      0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
      45: '🌫️', 48: '🌫️',
      51: '🌦️', 53: '🌦️', 55: '🌦️',
      61: '🌧️', 63: '🌧️', 65: '🌧️',
      71: '❄️', 73: '❄️', 75: '❄️',
      95: '⛈️', 96: '⛈️', 99: '⛈️'
    }
    return icons[code] || '🌤️'
  }

  const getWeatherDescription = (code: number) => {
    const descriptions: {[key: number]: string} = {
      0: t('weather.clearSky'),
      1: t('weather.mainlyClear'),
      2: t('weather.partlyCloudy'),
      3: t('weather.overcast'),
      45: t('weather.foggy'),
      48: t('weather.foggy'),
      51: t('weather.lightDrizzle'),
      53: t('weather.moderateDrizzle'),
      55: t('weather.heavyDrizzle'),
      61: t('weather.slightRain'),
      63: t('weather.moderateRain'),
      65: t('weather.heavyRain'),
      71: t('weather.slightSnow'),
      73: t('weather.moderateSnow'),
      75: t('weather.heavySnow'),
      95: t('weather.thunderstorm'),
      96: t('weather.thunderstormHail'),
      99: t('weather.thunderstormHeavyHail')
    }
    return descriptions[code] || t('weather.partlyCloudy')
  }

  const getAdviceColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-orange-300 bg-orange-50'
      case 'info':
        return 'border-blue-300 bg-blue-50'
      case 'success':
        return 'border-green-300 bg-green-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-300 bg-red-50 text-red-900'
      case 'medium':
        return 'border-orange-300 bg-orange-50 text-orange-900'
      case 'low':
        return 'border-yellow-300 bg-yellow-50 text-yellow-900'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  if (loading && !weatherData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">{t('weather.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 md:p-4 lg:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6 pb-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-orange-500/10 rounded-xl">
            <Cloud className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('weather.title')}</h1>
            <p className="text-xs md:text-sm text-gray-600">{t('weather.subtitle')}</p>
          </div>
        </div>
        {location && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{location.city}</p>
                {location.state && (
                  <p className="text-xs text-gray-600">{location.state}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-700 bg-white/50 px-2 py-1 rounded border border-gray-200">
              <span className="text-orange-600 font-semibold">Lat:</span>
              <span>{location.lat.toFixed(4)}</span>
              <span className="text-orange-600 font-semibold">Lon:</span>
              <span>{location.lon.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Location Search - Enhanced UI */}
      <Card className="border-orange-200 shadow-sm">
        <CardHeader className="p-3 md:p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-t-lg">
          <CardTitle className="text-base md:text-lg flex items-center gap-2 text-gray-800">
            <div className="p-1.5 bg-orange-500 rounded-lg">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            {t('weather.searchLocation')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 space-y-3 md:space-y-4">
          {/* Input Type Toggle - Enhanced Buttons */}
          <div className="flex flex-wrap gap-2 p-1 bg-gray-50 rounded-lg">
            <button
              onClick={() => setInputType('auto')}
              className={`px-3 py-2 text-xs md:text-sm rounded-lg transition-all duration-200 flex items-center gap-1.5 font-medium ${
                inputType === 'auto'
                  ? 'bg-orange-500 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-102'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {t('weather.auto')}
            </button>
            <button
              onClick={() => setInputType('pincode')}
              className={`px-3 py-2 text-xs md:text-sm rounded-lg transition-all duration-200 font-medium ${
                inputType === 'pincode'
                  ? 'bg-orange-500 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-102'
              }`}
            >
              {t('weather.pincode')}
            </button>
            <button
              onClick={() => setInputType('city')}
              className={`px-3 py-2 text-xs md:text-sm rounded-lg transition-all duration-200 flex items-center gap-1.5 font-medium ${
                inputType === 'city'
                  ? 'bg-orange-500 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-102'
              }`}
            >
              <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {t('weather.city')}
            </button>
            <button
              onClick={() => setInputType('coordinates')}
              className={`px-3 py-2 text-xs md:text-sm rounded-lg transition-all duration-200 font-medium ${
                inputType === 'coordinates'
                  ? 'bg-orange-500 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-102'
              }`}
            >
              {t('weather.coordinates')}
            </button>
          </div>

          {/* Input Fields - Enhanced with better styling */}
          {inputType === 'pincode' && (
            <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <input
                  type="text"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t('weather.enterPincode')}
                  className="w-full px-4 py-3 md:px-5 md:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm md:text-base transition-all shadow-sm hover:border-orange-300"
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch('pincode')}
                />
              </div>
              <Button
                onClick={() => handleLocationSearch('pincode')}
                disabled={searching || !pincodeInput || pincodeInput.length < 6}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base py-3 shadow-md hover:shadow-lg transition-all"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t('weather.searching')}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    {t('weather.searchByPincode')}
                  </>
                )}
              </Button>
            </div>
          )}

          {inputType === 'city' && (
            <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder={t('weather.enterCity')}
                  className="w-full px-4 py-3 md:px-5 md:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm md:text-base transition-all shadow-sm hover:border-orange-300"
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch('city')}
                />
              </div>
              <Button
                onClick={() => handleLocationSearch('city')}
                disabled={searching || !cityInput.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base py-3 shadow-md hover:shadow-lg transition-all"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t('weather.searching')}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    {t('weather.searchByCity')}
                  </>
                )}
              </Button>
            </div>
          )}

          {inputType === 'coordinates' && (
            <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="relative">
                  <label className="block text-xs text-gray-600 mb-1.5 font-medium">{t('weather.latitude')}</label>
                  <input
                    type="number"
                    step="any"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    placeholder="16.3067"
                    className="w-full px-4 py-3 md:px-5 md:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm md:text-base transition-all shadow-sm hover:border-orange-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs text-gray-600 mb-1.5 font-medium">{t('weather.longitude')}</label>
                  <input
                    type="number"
                    step="any"
                    value={lonInput}
                    onChange={(e) => setLonInput(e.target.value)}
                    placeholder="80.4365"
                    className="w-full px-4 py-3 md:px-5 md:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm md:text-base transition-all shadow-sm hover:border-orange-300"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleLocationSearch('coordinates')}
                disabled={searching || !latInput || !lonInput}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base py-3 shadow-md hover:shadow-lg transition-all"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t('weather.searching')}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    {t('weather.searchByCoordinates')}
                  </>
                )}
              </Button>
            </div>
          )}

          {inputType === 'auto' && (
            <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>{t('weather.autoLocationInfo')}</span>
                </p>
              </div>
              <Button
                onClick={() => handleAutoLocation()}
                disabled={searching || loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base py-3 shadow-md hover:shadow-lg transition-all"
              >
                {searching || loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t('weather.gettingLocation')}
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 mr-2" />
                    {t('weather.useCurrentLocation')}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Weather - Mobile Optimized */}
      {weatherData?.current && (
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Sun className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
              {t('weather.currentConditions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <div className="grid grid-cols-2 gap-2 md:gap-6">
              <div className="flex flex-col items-center text-center gap-2 bg-white/60 p-3 md:p-5 rounded-xl shadow-sm">
                <div className="p-2 md:p-3 bg-red-100 rounded-xl">
                  <Thermometer className="w-5 h-5 md:w-8 md:h-8 text-red-500 flex-shrink-0" />
                </div>
                <div className="min-w-0 w-full">
                  <p className="text-xs md:text-base text-gray-600 font-medium mb-1">{t('weather.temperature')}</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900">
                    {Math.round(weatherData.current.temperature_2m)}°C
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-2 bg-white/60 p-3 md:p-5 rounded-xl shadow-sm">
                <div className="p-2 md:p-3 bg-blue-100 rounded-xl">
                  <Cloud className="w-5 h-5 md:w-8 md:h-8 text-blue-500 flex-shrink-0" />
                </div>
                <div className="min-w-0 w-full flex-1">
                  <p className="text-xs md:text-base text-gray-600 font-medium mb-1">{t('weather.condition')}</p>
                  <div className="flex flex-col items-center gap-1 md:flex-row md:gap-2 md:justify-center">
                    <span className="text-xl md:text-3xl">{getWeatherIcon(weatherData.current.weather_code)}</span>
                    <p className="text-xs md:text-lg font-semibold text-gray-900 line-clamp-2">
                      {getWeatherDescription(weatherData.current.weather_code)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agricultural Alerts - Mobile Optimized */}
      {weatherData?.agricultural?.alerts && weatherData.agricultural.alerts.length > 0 && (
        <Card className="border-2 border-red-200">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
              {t('weather.weatherAlerts')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
            {weatherData.agricultural.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 md:p-4 rounded-lg border-2 ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start gap-2 md:gap-3">
                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm md:text-lg mb-1">{alert.title}</h3>
                    <p className="text-xs md:text-sm mb-2">{alert.message}</p>
                    <p className="text-xs font-medium capitalize">
                      Action: {alert.action.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Crop Advice - Mobile Optimized */}
      {weatherData?.agricultural?.cropAdvice && weatherData.agricultural.cropAdvice.length > 0 && (
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Sprout className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              {t('weather.cropAdvice')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
            {weatherData.agricultural.cropAdvice.map((advice, index) => (
              <div
                key={index}
                className={`p-3 md:p-4 rounded-lg border-2 ${getAdviceColor(advice.type)}`}
              >
                <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-1">{advice.title}</h3>
                <p className="text-xs md:text-sm text-gray-700 mb-2">{advice.message}</p>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {advice.crops.map((crop, cropIndex) => (
                    <span
                      key={cropIndex}
                      className="text-xs px-2 py-0.5 md:px-2 md:py-1 bg-white/50 rounded-full text-gray-700"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Farming Tips - Mobile Optimized */}
      {weatherData?.agricultural?.farmingTips && weatherData.agricultural.farmingTips.length > 0 && (
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              {t('weather.farmingTips')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              {weatherData.agricultural.farmingTips.map((tip, index) => (
                <div
                  key={index}
                  className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <span className="text-xl md:text-2xl flex-shrink-0">{tip.icon}</span>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs md:text-sm text-gray-900 mb-1">{tip.title}</h4>
                      <p className="text-xs md:text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Forecast - Mobile Optimized */}
      {weatherData?.daily && (
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              {forecastDays}-{t('weather.forecast')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <div className="space-y-2 md:space-y-3">
              {weatherData.daily.time.slice(0, forecastDays).map((date, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    <span className="text-xl md:text-2xl flex-shrink-0">
                      {getWeatherIcon(weatherData.daily!.weather_code[index])}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm md:text-base text-gray-900 truncate">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {weatherData.daily!.weather_code[index] === 0 ? 'Clear' : 'Variable'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-6 flex-wrap sm:flex-nowrap">
                    <div className="text-center sm:text-right min-w-[60px]">
                      <p className="text-xs text-gray-600">High</p>
                      <p className="font-bold text-sm md:text-base text-gray-900">
                        {Math.round(weatherData.daily!.temperature_2m_max[index])}°C
                      </p>
                    </div>
                    <div className="text-center sm:text-right min-w-[60px]">
                      <p className="text-xs text-gray-600">Low</p>
                      <p className="font-bold text-sm md:text-base text-gray-900">
                        {Math.round(weatherData.daily!.temperature_2m_min[index])}°C
                      </p>
                    </div>
                    <div className="text-center sm:text-right min-w-[60px]">
                      <p className="text-xs text-gray-600">Rain</p>
                      <p className="font-bold text-sm md:text-base text-gray-900">
                        {weatherData.daily!.precipitation_sum[index]?.toFixed(1) || 0}mm
                      </p>
                    </div>
                    <div className="text-center sm:text-right min-w-[60px]">
                      <p className="text-xs text-gray-600">Wind</p>
                      <p className="font-bold text-sm md:text-base text-gray-900">
                        {Math.round((weatherData.daily!.wind_speed_10m_max[index] || 0) * 3.6)} km/h
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button - Mobile Optimized */}
      <div className="flex justify-center pb-4">
        <Button
          onClick={() => location && fetchAgriculturalWeather(location.lat, location.lon)}
          disabled={loading || !location}
          className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              {t('weather.refresh')}
            </>
          )}
        </Button>
      </div>
      </div>
    </div>
  )
}

export default EnhancedWeather
