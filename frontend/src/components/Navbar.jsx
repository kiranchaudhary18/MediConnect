import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, LogOut, Menu, X } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getDashboardPath = () => {
    if (user) {
      return `/${user.role}/dashboard`
    }
    return '/'
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link to="/" className="flex items-center text-xl md:text-2xl font-bold text-primary-600">
              MediConnect
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 transition">
                Home
              </Link>
              {user && (
                <Link to={getDashboardPath()} className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 transition">
                  Dashboard
                </Link>
              )}
              <Link to="/symptom-checker" className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 transition">
                Symptom Checker
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden lg:inline">{user.name}</span>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition text-sm"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Home
            </Link>
            {user && (
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/symptom-checker"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Symptom Checker
            </Link>
            {user ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  {user.name}
                </div>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 mx-4 text-center text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 mx-4 text-center bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
