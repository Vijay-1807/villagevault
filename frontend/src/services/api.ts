import axios from 'axios'

// In production (single service), use relative path or env variable
// In development, use localhost or env variable
const getApiUrl = () => {
  // Check if VITE_API_URL is set (for custom deployments)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // In production (single service), use relative path
  if (import.meta.env.MODE === 'production') {
    return ''
  }
  // In development, use localhost
  return 'http://localhost:5000'
}

const API_URL = getApiUrl()

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    const isTestUser = localStorage.getItem('isTestUser')
    const user = localStorage.getItem('user')
    
    console.log('API Request - isTestUser:', isTestUser, 'user:', user)
    
    if (isTestUser === 'true' && user) {
      // For test users, use test tokens based on role
      const userData = JSON.parse(user)
      if (userData.role === 'SARPANCH') {
        config.headers.Authorization = `Bearer test-sarpanch-token`
        console.log('API Request - Using sarpanch test token')
      } else {
        config.headers.Authorization = `Bearer test-villager-token`
        console.log('API Request - Using villager test token')
      }
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('API Request - Using regular token')
    } else {
      console.log('API Request - No token found')
    }
    
    console.log('API Request - Final headers:', config.headers)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
