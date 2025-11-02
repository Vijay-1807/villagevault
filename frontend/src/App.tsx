import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import React from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOTP from './pages/VerifyOTP'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Messages from './pages/Messages'
import SOS from './pages/SOS'
import Profile from './pages/Profile'
import VillageInfo from './pages/VillageInfo'
import AIChat from './pages/AIChat'
import EnhancedWeather from './pages/EnhancedWeather'
import LoadingSpinner from './components/LoadingSpinner'
import SecureNavigation from './components/SecureNavigation'
import ErrorBoundary from './components/ErrorBoundary'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  const { loading } = useAuth()

  // Show loading spinner only during initial load
  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <ErrorBoundary>
      <div className="h-screen bg-gray-50 overflow-hidden">
        <SecureNavigation />
        <Routes>
          {/* Public routes - only accessible when not authenticated */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <ErrorBoundary>
                  <Login />
                </ErrorBoundary>
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <ErrorBoundary>
                  <Register />
                </ErrorBoundary>
              </PublicRoute>
            } 
          />
          <Route 
            path="/verify-otp" 
            element={
              <PublicRoute>
                <ErrorBoundary>
                  <VerifyOTP />
                </ErrorBoundary>
              </PublicRoute>
            } 
          />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route path="alerts" element={<ErrorBoundary><Alerts /></ErrorBoundary>} />
            <Route path="messages" element={<ErrorBoundary><Messages /></ErrorBoundary>} />
            <Route path="sos" element={<ErrorBoundary><SOS /></ErrorBoundary>} />
            <Route path="profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
            <Route path="village" element={<ErrorBoundary><VillageInfo /></ErrorBoundary>} />
            <Route path="ai-chat" element={<ErrorBoundary><AIChat /></ErrorBoundary>} />
            <Route path="enhanced-weather" element={<ErrorBoundary><EnhancedWeather /></ErrorBoundary>} />
          </Route>
          
          {/* Catch all route - redirect based on auth status */}
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App
