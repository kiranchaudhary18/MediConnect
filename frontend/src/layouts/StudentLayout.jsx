import { useState, useRef, useEffect} from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BookOpen, 
  Bell,
  LogOut,
  Menu,
  X,
  Stethoscope,
  User,
  Moon,
  Sun,
  MessageCircle,
  Trash
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { getNotifications, markNotificationRead, deleteNotification } from '../services/patientService';

const StudentLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  // Load notifications from API
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
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
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
      toast.error('Failed to delete notification');
    }
  };

  const markAllAsRead = () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    Promise.all(unread.map((n) => markNotificationRead(n._id || n.id))).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setNotificationModalOpen(true);
    setNotificationOpen(false);
    if (!notification.read) {
      markAsRead(notification._id || notification.id);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Dark mode is handled by ThemeContext

  // Apply dark mode class on initial load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { name: 'Doctors', icon: Stethoscope, path: '/student/doctors' },
    { name: 'Patient Records', icon: FileText, path: '/student/patient-records' },
    { name: 'Assignments', icon: BookOpen, path: '/student/assignments' },
    { name: 'AI Learning', icon: MessageCircle, path: '/student/ai-learning' },
    { name: 'Community', icon: Users, path: '/student/community' },
  ];

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-20 flex-none h-full bg-white dark:bg-gray-800 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-white">
              Mediconnect
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  location.pathname === item.path
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSidebarOpen(false)}
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
              onClick={() => setSidebarOpen(false)}
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
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-white">
              Mediconnect
            </Link>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  location.pathname === item.path
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
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="p-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-white">
                Student Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-yellow-400' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                } transition-all duration-200 w-10 h-10 flex items-center justify-center`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Moon className="w-6 h-6 text-white" />
                )}
              </button>
              
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className={`p-2 rounded-full relative ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-white' 
                      : 'text-gray-700 hover:bg-gray-100 shadow-sm'
                  } transition-all duration-200 w-10 h-10 flex items-center justify-center`}
                  aria-label="Notifications"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notification dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Notifications {unreadCount > 0 && `(${unreadCount})`}
                        </h3>
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div 
                            key={notification._id || notification.id} 
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-indigo-50 dark:bg-gray-700' : ''}`}
                            onClick={() => openNotificationModal(notification)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start flex-1">
                                <div className="flex-shrink-0 pt-0.5">
                                  <div className={`h-2 w-2 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-indigo-500'}`}></div>
                                </div>
                                <div className="ml-3 flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                    {notification.message}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {notification.time || new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notification._id || notification.id);
                                }}
                                className="ml-2 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <Bell className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 5 && (
                      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
                        <button 
                          onClick={() => {
                            setNotificationOpen(false);
                            // Could navigate to a notifications page
                          }}
                          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          View all {notifications.length} notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

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

      {/* Notification Detail Modal */}
      {notificationModalOpen && selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                  <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notification Details
                </h2>
              </div>
              <button
                onClick={() => {
                  setNotificationModalOpen(false);
                  setSelectedNotification(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedNotification.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedNotification.time || new Date(selectedNotification.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              {selectedNotification.from && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span>From: {selectedNotification.from}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button
                onClick={() => {
                  handleDelete(selectedNotification._id || selectedNotification.id);
                  setNotificationModalOpen(false);
                  setSelectedNotification(null);
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => {
                  setNotificationModalOpen(false);
                  setSelectedNotification(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLayout;
