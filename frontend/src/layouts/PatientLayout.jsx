import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Stethoscope, 
  FileText, 
  Bell,
  LogOut,
  Menu,
  X,
  User,
  Moon,
  Sun,
  MessageSquare,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PatientLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
    { name: 'Book Appointment', icon: Calendar, path: '/patient/book-appointment' },
    { name: 'My Appointments', icon: Stethoscope, path: '/patient/appointments' },
    { name: 'Medical History', icon: FileText, path: '/patient/medical-history' },
    { name: 'Chat with Doctor', icon: MessageSquare, path: '/patient/chat' },
    { name: 'Health Tracker', icon: Activity, path: '/patient/health-tracker' },
    { name: 'Feedback', icon: MessageSquare, path: '/patient/feedback' },
  ];

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-20 flex flex-col h-full bg-white dark:bg-gray-800 w-64 transform ${isCollapsed ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-white">
            Mediconnect
          </Link>
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {[
            { name: 'Dashboard', icon: LayoutDashboard, href: '/patient/dashboard' },
            { name: 'Book Appointment', icon: Calendar, href: '/patient/book-appointment' },
            { name: 'My Appointments', icon: Stethoscope, href: '/patient/appointments' },
            { name: 'Medical History', icon: FileText, href: '/patient/medical-history' },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                location.pathname === item.href
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Profile and Logout */}
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/profile"
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => setProfileOpen(false)}
          >
            <User className="w-5 h-5 mr-3" />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-gray-200 lg:dark:border-gray-700 lg:bg-white lg:dark:bg-gray-800">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-white">
            Mediconnect
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {[
            { name: 'Dashboard', icon: LayoutDashboard, href: '/patient/dashboard' },
            { name: 'Book Appointment', icon: Calendar, href: '/patient/book-appointment' },
            { name: 'My Appointments', icon: Stethoscope, href: '/patient/appointments' },
            { name: 'Medical History', icon: FileText, href: '/patient/medical-history' },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                location.pathname === item.href
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Profile and Logout */}
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/profile"
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => setProfileOpen(false)}
          >
            <User className="w-5 h-5 mr-3" />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="p-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsCollapsed(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-white">
                Patient Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              
              <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.name || 'User'} 
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                    {user?.name || 'User'}
                  </span>
                </button>

                {/* Dropdown menu */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
