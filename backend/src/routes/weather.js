const express = require('express')
const { authenticate } = require('../middleware/auth')
const weatherService = require('../services/weatherService')

const router = express.Router()

// Get current weather forecast
router.get('/current', authenticate, async (req, res) => {
  try {
    const { latitude, longitude, days = 7 } = req.query

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }

    const weather = await weatherService.getCurrentWeather(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(days)
    )
    res.json(weather)
  } catch (error) {
    console.error('Error fetching weather:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch weather data' })
  }
})

// Get agricultural weather forecast with crop-specific advice
router.get('/agricultural', authenticate, async (req, res) => {
  try {
    const { latitude, longitude, days = 10 } = req.query

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }

    const weather = await weatherService.getAgriculturalWeather(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(days)
    )
    res.json(weather)
  } catch (error) {
    console.error('Error fetching agricultural weather:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch agricultural weather data' })
  }
})

// Get weather code description
router.get('/code/:code', authenticate, async (req, res) => {
  try {
    const { code } = req.params
    const description = weatherService.getWeatherCodeDescription(parseInt(code))
    res.json(description)
  } catch (error) {
    console.error('Error getting weather code description:', error)
    res.status(500).json({ error: 'Failed to get weather code description' })
  }
})

module.exports = router

