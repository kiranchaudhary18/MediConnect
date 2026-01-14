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
  Activity,
  Trash
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { getNotifications, markNotificationRead, deleteNotification } from '../services/patientService';

export default function PatientLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isFullWidth = false; // Always show sidebar

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };
    loadNotifications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((notif) =>
        notif._id === id || notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Failed to mark notification read', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
      toast.success(res?.message || 'Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification', err);
      const msg = err?.response?.data?.message || err.message || 'Failed to delete notification';
      toast.error(msg);
    }
  };

  const markAllAsRead = () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    Promise.all(unread.map((n) => markNotificationRead(n._id || n.id))).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  // Dark mode is now handled by ThemeContext

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      {!isFullWidth && (
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
            { name: 'Messages', icon: MessageSquare, href: '/patient/chat' },
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
      )}

      {/* Desktop sidebar */}
      {!isFullWidth && (
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
            { name: 'Messages', icon: MessageSquare, href: '/patient/chat' },
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
      )}

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
                className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
              
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id || notification.id}
                            className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                            }`}
                            onClick={async () => {
                              // mark as read then open modal with details
                              try {
                                await markNotificationRead(notification._id || notification.id);
                              } catch (err) {
                                console.error('mark read failed', err);
                              }
                              setNotifications((prev) => prev.map((n) => (n._id === (notification._id || notification.id) || n.id === (notification._id || notification.id) ? { ...n, read: true } : n)));
                              setSelectedNotification(notification);
                              setNotificationModalOpen(true);
                              setNotificationOpen(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {notification.message}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                    {notification.time || new Date(notification.createdAt || Date.now()).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-3 flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notification._id || notification.id);
                                  }}
                                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                                  aria-label="Delete notification"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
                      <Link
                        to="/patient/notifications"
                        className="text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                        onClick={() => setNotificationOpen(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

                {/* Notification detail modal */}
                {notificationModalOpen && selectedNotification && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setNotificationModalOpen(false)} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-xl w-full mx-4 p-6 z-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedNotification.title}</h3>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{selectedNotification.time || new Date(selectedNotification.createdAt || Date.now()).toLocaleString()}</p>
                        </div>
                        <button onClick={() => setNotificationModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">Close</button>
                      </div>
                      <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                        {selectedNotification.message}
                      </div>
                      <div className="mt-6 text-right">
                        <button
                          onClick={() => setNotificationModalOpen(false)}
                          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              
              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
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
          <div className={isFullWidth ? 'w-full mx-0' : 'max-w-7xl mx-auto'}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
