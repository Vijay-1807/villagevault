import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Phone, ArrowRight } from 'lucide-react'
import LanguageSelector from '../components/LanguageSelector'

const Login = () => {
  const { login, user, loading } = useAuth()
  const { t } = useLanguage()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Show loading during auth initialization
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="spinner"></div>
    </div>
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) return

    setLoginLoading(true)
    try {
      await login(phoneNumber.trim())
      // Redirect to OTP verification
      window.location.href = '/verify-otp'
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-4 px-4 sm:py-8 md:py-12 sm:px-6 lg:px-8 relative overflow-y-auto"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1564426699369-f14249ac2c32?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmlsbGFnZSUyMG5hdHVyZXxlbnwwfHwwfHx8MA%3D%3D&fm=jpg&q=60&w=3000)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50"></div>
      
      {/* Language Selector - Top Right */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
        <LanguageSelector />
      </div>
      
      <div className="max-w-md w-full space-y-3 sm:space-y-5 md:space-y-8 relative z-10 mx-auto px-3 sm:px-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4 md:mb-5">
            <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white flex items-center justify-center" style={{ fontFamily: 'serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              <div className="h-16 w-16 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 flex-shrink-0 drop-shadow-lg -mr-1 sm:-mr-2">
                <img 
                  src="/DeWatermark.ai_1760249488029-removebg-preview.png" 
                  alt="V Logo" 
                  className="h-full w-full object-contain"
                  loading="eager"
                />
              </div>
              <span className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight drop-shadow-lg">illageVault</span>
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-white mb-4 sm:mb-5 md:mb-6 font-medium px-3 sm:px-4 break-words drop-shadow-md" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            {t('app.subtitle')}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
            {t('auth.login')}
          </h2>
        </div>
        
        <form className="mt-4 sm:mt-6 md:mt-8 space-y-4 sm:space-y-5 md:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm sm:text-base font-semibold text-white mb-2 sm:mb-2.5 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
              {t('auth.phoneNumber')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pl-12 sm:pl-14 bg-white border-2 border-gray-300 rounded-xl text-base sm:text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 min-h-[52px] touch-manipulation shadow-md"
                placeholder="7286973788"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 10) {
                    setPhoneNumber(value)
                  }
                }}
                maxLength={10}
                autoComplete="tel"
                autoFocus={false}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loginLoading || !phoneNumber.trim() || phoneNumber.length !== 10}
              className="group relative w-full flex justify-center items-center py-4 sm:py-4.5 px-5 border border-transparent text-base sm:text-lg font-bold rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 min-h-[56px] touch-manipulation shadow-xl hover:shadow-2xl"
            >
              {loginLoading ? (
                <div className="spinner border-3 border-white border-t-transparent h-6 w-6"></div>
              ) : (
                <>
                  <span>{t('auth.login')}</span>
                  <ArrowRight className="ml-2.5 h-5 w-5 sm:h-6 sm:w-6" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-3">
            <p className="text-sm sm:text-base text-white px-3 drop-shadow-md" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-orange-300 hover:text-orange-200 active:text-orange-100 transition-colors duration-300 underline underline-offset-3 touch-manipulation"
              >
                {t('auth.register')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
