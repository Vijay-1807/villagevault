import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  Home, 
  AlertTriangle, 
  MessageSquare, 
  Phone, 
  MapPin,
  LogOut,
  ChevronRight,
  Bot,
  Cloud
} from 'lucide-react'

const Sidebar = ({ isMobileOpen, onMobileClose }: { isMobileOpen?: boolean, onMobileClose?: () => void }) => {
  const { user, logout } = useAuth()
  const { t } = useLanguage()

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: Home },
    { name: t('nav.alerts'), href: '/alerts', icon: AlertTriangle },
    { name: t('nav.messages'), href: '/messages', icon: MessageSquare },
    { name: t('nav.sos'), href: '/sos', icon: Phone },
    { name: t('ai.title'), href: '/ai-chat', icon: Bot, isAI: true },
    { name: t('weather.title'), href: '/enhanced-weather', icon: Cloud },
    { name: t('nav.village'), href: '/village', icon: MapPin },
  ]

  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col">
        <div className="flex flex-col flex-grow bg-black/95 backdrop-blur-xl border-r border-orange-500/20 overflow-y-auto">
          {/* Spacer for header overlap */}
          <div className="h-16 flex-shrink-0"></div>
          
          {/* Navigation Section */}
          <div className="flex-grow flex flex-col justify-center px-4 py-6">
            <nav className="flex-1 flex flex-col justify-center space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `group relative flex items-center justify-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 ease-in-out ${
                        item.isAI 
                          ? isActive
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                            : 'text-gray-300 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/30'
                          : isActive
                            ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10'
                            : 'text-gray-300 hover:bg-orange-500/10 hover:text-orange-300 hover:border-orange-500/30'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-xl mr-3 transition-all duration-200 ease-in-out ${
                          item.isAI
                            ? isActive
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25'
                              : 'bg-gray-700/50 group-hover:bg-purple-500/30'
                            : isActive
                              ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25'
                              : 'bg-gray-700/50 group-hover:bg-orange-500/30'
                        }`}>
                          <Icon className={`w-4 h-4 transition-colors duration-200 ease-in-out ${
                            item.isAI
                              ? isActive
                                ? 'text-white'
                                : 'text-gray-400 group-hover:text-purple-300'
                              : isActive
                                ? 'text-white'
                                : 'text-gray-400 group-hover:text-orange-300'
                          }`} />
                        </div>
                        <span className="text-center flex-1">{item.name}</span>
                        <ChevronRight className={`w-4 h-4 ml-3 transition-all duration-200 ease-in-out ${
                          item.isAI
                            ? isActive
                              ? 'text-purple-400 translate-x-0'
                              : 'text-gray-500 -translate-x-2 group-hover:translate-x-0 group-hover:text-purple-300'
                            : isActive
                              ? 'text-orange-400 translate-x-0'
                              : 'text-gray-500 -translate-x-2 group-hover:translate-x-0 group-hover:text-orange-300'
                        }`} />
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>
          
          {/* User Profile Section */}
          <div className="flex-shrink-0 border-t border-orange-500/10 p-6">
            <div className="flex items-center space-x-4">
              <NavLink
                to="/profile"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `group flex items-center flex-1 min-w-0 space-x-4 rounded-xl p-2 -m-2 transition-all duration-200 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20'
                      : 'hover:bg-orange-500/10'
                  }`
                }
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <span className="text-white font-bold text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-orange-400 capitalize font-medium">{user?.role?.toLowerCase()}</p>
                </div>
              </NavLink>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  logout()
                }}
                className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group flex-shrink-0"
                title={t('auth.logout')}
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="fixed inset-y-0 left-0 w-72 bg-black/95 backdrop-blur-xl border-r border-orange-500/20">
            <div className="flex flex-col h-full">
              {/* Spacer for header overlap */}
              <div className="h-16 flex-shrink-0"></div>
              
              {/* Mobile Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 ease-in-out ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10'
                            : 'text-gray-300 hover:bg-orange-500/10 hover:text-orange-300 hover:border-orange-500/30'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-xl mr-4 transition-all duration-200 ease-in-out ${
                            isActive
                              ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25'
                              : 'bg-gray-700/50 group-hover:bg-orange-500/30'
                          }`}>
                            <Icon className={`w-4 h-4 transition-colors duration-200 ease-in-out ${
                              isActive
                                ? 'text-white'
                                : 'text-gray-400 group-hover:text-orange-300'
                            }`} />
                          </div>
                          <span className="flex-1">{item.name}</span>
                          <ChevronRight className={`w-4 h-4 transition-all duration-200 ease-in-out ${
                            isActive
                              ? 'text-orange-400 translate-x-0'
                              : 'text-gray-500 -translate-x-2 group-hover:translate-x-0 group-hover:text-orange-300'
                          }`} />
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </nav>
              
              {/* Mobile User Profile */}
              <div className="p-6 border-t border-orange-500/10">
                <div className="flex items-center space-x-4">
                  <NavLink
                    to="/profile"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `group flex items-center flex-1 min-w-0 space-x-4 rounded-xl p-2 -m-2 transition-all duration-200 ease-in-out ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20'
                          : 'hover:bg-orange-500/10'
                      }`
                    }
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                        <span className="text-white font-bold text-lg">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-orange-400 capitalize font-medium">{user?.role?.toLowerCase()}</p>
                    </div>
                  </NavLink>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      logout()
                    }}
                    className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group flex-shrink-0"
                    title={t('auth.logout')}
                  >
                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
