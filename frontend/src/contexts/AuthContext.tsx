import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { auth, db } from '../config/firebase'
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

interface User {
  id: string
  phoneNumber: string
  name: string
  role: 'SARPANCH' | 'VILLAGER'
  pinCode: string
  villageName: string
  villageId: string
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (phoneNumber: string) => Promise<void>
  verifyOTP: (phoneNumber: string, otp: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
}

interface RegisterData {
  phoneNumber: string
  name: string
  role: 'SARPANCH' | 'VILLAGER'
  pinCode: string
  villageName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)
  // Note: isTestUser state is used to track test user status (stored in localStorage but state needed for logout cleanup)
  const [, setIsTestUser] = useState(false) // State setter used but value not directly accessed (prefer localStorage check)

  // Debug function to test OTP popup
  const testOTPPopup = () => {
    const randomOTPs = ['2384', '1234', '1807']
    const testOTP = randomOTPs[Math.floor(Math.random() * randomOTPs.length)]
    console.log('Debug - Showing random OTP:', testOTP)
    toast.success(
      <div className="text-center">
        <div className="text-lg font-bold text-white mb-2">🔐 Test OTP</div>
        <div className="text-2xl font-mono font-bold text-white mb-1">{testOTP}</div>
        <div className="text-sm text-gray-300">For development only</div>
      </div>,
      {
        duration: 10000,
        style: {
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          border: '1px solid #374151'
        }
      }
    )
  }

  // Make test function available globally for debugging
  ;(window as any).testOTPPopup = testOTPPopup
  
  // Debug function to check current OTP state
  const debugOTPState = () => {
    console.log('=== OTP Debug State ===')
    console.log('Stored testOTP:', (window as any).testOTP)
    console.log('Pending user data:', (window as any).pendingUserData)
    console.log('Test phone number:', (window as any).testPhoneNumber)
    console.log('Current user:', user)
    console.log('======================')
  }
  ;(window as any).debugOTPState = debugOTPState

  useEffect(() => {
    // Initialize reCAPTCHA verifier
    if (typeof window !== 'undefined') {
      try {
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA solved')
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired')
          }
        })
        setRecaptchaVerifier(verifier)
      } catch (error) {
        console.log('reCAPTCHA initialization error:', error)
        // Continue without reCAPTCHA for development
      }
    }

    // Check for existing user in localStorage first
    const savedUser = localStorage.getItem('user')
    const isTestUserFlag = localStorage.getItem('isTestUser')
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsTestUser(isTestUserFlag === 'true')
        console.log('Restored user from localStorage:', userData, 'isTestUser:', isTestUserFlag === 'true')
    } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('isTestUser')
      }
    }
    
    // Stop loading - initialization complete
    setLoading(false)

    // Listen for authentication state changes (only for real Firebase users)
    let unsubscribe: (() => void) | null = null
    
    // Only set up Firebase auth listener if we don't have a test user
    if (!savedUser || isTestUserFlag !== 'true') {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              const userObj: User = {
                id: firebaseUser.uid,
                phoneNumber: userData.phoneNumber,
                name: userData.name,
                role: userData.role as 'SARPANCH' | 'VILLAGER',
                pinCode: userData.pinCode,
                villageName: userData.villageName,
                villageId: userData.villageId,
                isVerified: userData.isVerified
              }
              setUser(userObj)
              // Get Firebase ID token
              const firebaseToken = await firebaseUser.getIdToken()
              setToken(firebaseToken)
              // Store in localStorage for persistence
              localStorage.setItem('user', JSON.stringify(userObj))
              localStorage.setItem('token', firebaseToken)
            }
          } catch (error) {
            console.error('Error fetching user data:', error)
            toast.error('Error loading user data')
          }
        } else {
          setUser(null)
          setToken(null)
          localStorage.removeItem('user')
          localStorage.removeItem('token')
        }
      })
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const login = async (phoneNumber: string) => {
    try {
      // For development with free tier, use test phone numbers with roles
      const testPhoneNumbers = {
        '7286973788': { role: 'SARPANCH', name: 'Village Sarpanch' },
        '6305994096': { role: 'VILLAGER', name: 'Test Villager 1' },
        '9849119427': { role: 'VILLAGER', name: 'Test Villager 2' }
      }
      
      // Check if it's a test phone number (remove any spaces, dashes, or country codes)
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '') // Remove all non-digits
      
      console.log('Login - Checking phone number:', cleanPhoneNumber, 'against test numbers:', Object.keys(testPhoneNumbers))
      
      if (testPhoneNumbers[cleanPhoneNumber as keyof typeof testPhoneNumbers]) {
        // For test numbers, generate random OTP
        const randomOTPs = ['2384', '1234', '1807']
        const testOTP = randomOTPs[Math.floor(Math.random() * randomOTPs.length)]
        ;(window as any).testOTP = testOTP
        ;(window as any).testPhoneNumber = phoneNumber
        
        console.log('Login - Test phone number detected, showing OTP:', testOTP)
        
        // Store phone number for OTP verification
        localStorage.setItem('phoneNumber', phoneNumber)
        
        // Show beautiful OTP notification with black and white theme
        toast.success(
          <div className="text-center">
            <div className="text-lg font-bold text-white mb-2">🔐 Test OTP</div>
            <div className="text-2xl font-mono font-bold text-white mb-1">{testOTP}</div>
            <div className="text-sm text-gray-300">For development only</div>
          </div>,
          {
            duration: 10000,
            style: {
              background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              border: '1px solid #374151'
            }
          }
        )
        
        // Redirect to verify OTP page
        setTimeout(() => {
          window.location.href = '/verify-otp'
        }, 2000)
        return
      }

      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized')
      }

      const appVerifier = recaptchaVerifier
      const phoneNumberWithCountryCode = `+91${phoneNumber}`
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumberWithCountryCode, appVerifier)
      
      // Store confirmation result for OTP verification
      ;(window as any).confirmationResult = confirmationResult
      
      toast.success('OTP sent to your phone number', {
        style: {
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          border: '1px solid #374151'
        }
      })
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.code === 'auth/billing-not-enabled') {
        toast.error(
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 mb-2">📱 SMS Quota Exceeded</div>
            <div className="text-sm text-gray-600 mb-2">Use test phone numbers:</div>
            <div className="text-sm font-mono text-blue-600">7286973788, 6305994096, 9849119427</div>
          </div>,
          {
            duration: 8000,
            style: {
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }
          }
        )
      } else {
        toast.error(error.message || 'Failed to send OTP')
      }
      throw error
    }
  }

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    try {
      // Check for test OTP
      const testOTP = (window as any).testOTP
      const pendingUserData = (window as any).pendingUserData
      
      console.log('VerifyOTP - Input OTP:', otp)
      console.log('VerifyOTP - Stored testOTP:', testOTP)
      console.log('VerifyOTP - Phone number:', phoneNumber)
      console.log('VerifyOTP - Pending user data:', pendingUserData)
      
      // Check if it's a test phone number and OTP matches
      const testPhoneNumbers = {
        '7286973788': { role: 'SARPANCH', name: 'Village Sarpanch' },
        '6305994096': { role: 'VILLAGER', name: 'Test Villager 1' },
        '9849119427': { role: 'VILLAGER', name: 'Test Villager 2' }
      }
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')
      const testUserInfo = testPhoneNumbers[cleanPhoneNumber as keyof typeof testPhoneNumbers]
      const isTestPhone = !!testUserInfo
      const randomOTPs = ['2384', '1234', '1807']
      
      console.log('VerifyOTP - Is test phone:', isTestPhone)
      console.log('VerifyOTP - Clean phone number:', cleanPhoneNumber)
      console.log('VerifyOTP - Test user info:', testUserInfo)
      
      if (isTestPhone && randomOTPs.includes(otp)) {
        // For test OTP, create a mock user with the correct role
        const mockUser: User = {
          id: 'test-user-id',
          phoneNumber: phoneNumber,
          name: testUserInfo.name,
          role: testUserInfo.role as 'SARPANCH' | 'VILLAGER',
          pinCode: pendingUserData?.pinCode || '522508',
          villageName: pendingUserData?.villageName || 'Test Village',
          villageId: 'test-village-id',
          isVerified: true
        }
        setUser(mockUser)
        setToken('test-token')
        setIsTestUser(true)
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(mockUser))
        localStorage.setItem('isTestUser', 'true')
        
        // Show beautiful success notification with black and white theme
        toast.success(
          <div className="text-center">
            <div className="text-lg font-bold text-white mb-2">🎉 Login Successful!</div>
            <div className="text-sm text-gray-300">Welcome to VillageVault</div>
          </div>,
          {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              border: '1px solid #374151'
            }
          }
        )
        
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
        return
      }

      const confirmationResult = (window as any).confirmationResult
      if (!confirmationResult) {
        throw new Error('No confirmation result found')
      }

      const result = await confirmationResult.confirm(otp)
      const firebaseUser = result.user

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const userObj: User = {
          id: firebaseUser.uid,
          phoneNumber: userData.phoneNumber,
          name: userData.name,
          role: userData.role as 'SARPANCH' | 'VILLAGER',
          pinCode: userData.pinCode,
          villageName: userData.villageName,
          villageId: userData.villageId,
          isVerified: userData.isVerified
        }
        setUser(userObj)
        // Get Firebase ID token for authentication
        const firebaseToken = await firebaseUser.getIdToken()
        setToken(firebaseToken)
        localStorage.setItem('token', firebaseToken)
        toast.success('Login successful!', {
          style: {
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            border: '1px solid #374151'
          }
        })
      } else {
        throw new Error('User data not found')
      }
    } catch (error: any) {
      console.error('OTP verification error:', error)
      
      // Check if it's a test phone number for better error message
      const testPhoneNumbers = ['7286973788', '6305994096', '9849119427']
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')
      const isTestPhone = testPhoneNumbers.includes(cleanPhoneNumber)
      const randomOTPs = ['2384', '1234', '1807']
      
      if (isTestPhone) {
        toast.error(
          <div className="text-center">
            <div className="text-sm text-white">Invalid OTP for test number</div>
            <div className="text-xs text-gray-300">Valid OTPs: {randomOTPs.join(', ')}</div>
          </div>,
          {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              border: '1px solid #374151'
            }
          }
        )
      } else {
        toast.error('Invalid OTP')
      }
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      // For development with free tier, use test phone numbers with roles
      const testPhoneNumbers = {
        '7286973788': { role: 'SARPANCH', name: 'Village Sarpanch' },
        '6305994096': { role: 'VILLAGER', name: 'Test Villager 1' },
        '9849119427': { role: 'VILLAGER', name: 'Test Villager 2' }
      }
      
      // Check if it's a test phone number (remove any spaces, dashes, or country codes)
      const cleanPhoneNumber = userData.phoneNumber.replace(/\D/g, '') // Remove all non-digits
      
      console.log('Register - Checking phone number:', cleanPhoneNumber, 'against test numbers:', Object.keys(testPhoneNumbers))
      
      if (testPhoneNumbers[cleanPhoneNumber as keyof typeof testPhoneNumbers]) {
        // For test numbers, generate random OTP
        const randomOTPs = ['2384', '1234', '1807']
        const testOTP = randomOTPs[Math.floor(Math.random() * randomOTPs.length)]
        ;(window as any).testOTP = testOTP
        ;(window as any).pendingUserData = userData
        ;(window as any).testPhoneNumber = userData.phoneNumber
        
        console.log('Register - Test phone number detected, showing OTP:', testOTP)
        
        // Store phone number for OTP verification
        localStorage.setItem('phoneNumber', userData.phoneNumber)
        
        // Show beautiful OTP notification with black and white theme
        toast.success(
          <div className="text-center">
            <div className="text-lg font-bold text-white mb-2">🔐 Test OTP</div>
            <div className="text-2xl font-mono font-bold text-white mb-1">{testOTP}</div>
            <div className="text-sm text-gray-300">For development only</div>
          </div>,
          {
            duration: 10000,
            style: {
              background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              border: '1px solid #374151'
            }
          }
        )
        
        // Redirect to verify OTP page
        setTimeout(() => {
          window.location.href = '/verify-otp'
        }, 2000)
        return
      }

      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized')
      }

      const appVerifier = recaptchaVerifier
      const phoneNumberWithCountryCode = `+91${userData.phoneNumber}`
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumberWithCountryCode, appVerifier)
      
      // Store confirmation result and user data for OTP verification
      ;(window as any).confirmationResult = confirmationResult
      ;(window as any).pendingUserData = userData
      
      toast.success('OTP sent to your phone number', {
        style: {
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          border: '1px solid #374151'
        }
      })
    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.code === 'auth/billing-not-enabled') {
        toast.error(
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 mb-2">📱 SMS Quota Exceeded</div>
            <div className="text-sm text-gray-600 mb-2">Use test phone numbers:</div>
            <div className="text-sm font-mono text-blue-600">7286973788, 6305994096, 9849119427</div>
          </div>,
          {
            duration: 8000,
            style: {
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              color: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }
          }
        )
      } else {
        toast.error(error.message || 'Failed to send OTP')
      }
      throw error
    }
  }

  const logout = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setToken(null)
      setIsTestUser(false)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('isTestUser')
      localStorage.removeItem('phoneNumber')
      // Clear test data
      ;(window as any).testOTP = null
      ;(window as any).pendingUserData = null
      ;(window as any).testPhoneNumber = null
      toast.success('Logged out successfully', {
        style: {
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          border: '1px solid #374151'
        }
      })
    } catch (error: any) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    verifyOTP,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" style={{ display: 'none' }}></div>
    </AuthContext.Provider>
  )
}