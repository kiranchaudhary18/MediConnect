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
  Trash,
  Search,
  Heart,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { getNotifications, markNotificationRead, deleteNotification } from '../services/patientService';

export default function PatientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
    { name: 'Book Appointment', icon: Calendar, path: '/patient/book-appointment' },
    { name: 'My Appointments', icon: Stethoscope, path: '/patient/appointments' },
    { name: 'Medical History', icon: FileText, path: '/patient/medical-history' },
    { name: 'Messages', icon: MessageSquare, path: '/patient/messages' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">MediConnect</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                  Patient Portal
                </span>
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(item.path) 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
              {isActive(item.path) && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'Patient'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/profile"
                className="flex-1 text-center py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 text-center py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Health Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <button onClick={markAllAsRead} className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n._id || n.id}
                          onClick={async () => {
                            await markAsRead(n._id || n.id);
                            setSelectedNotification(n);
                            setNotificationModalOpen(true);
                            setNotificationOpen(false);
                          }}
                          className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 ${!n.read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{n.message}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(n._id || n.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/patient/notifications"
                      onClick={() => setNotificationOpen(false)}
                      className="block w-full text-center py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center overflow-hidden">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white max-w-[120px] truncate hidden sm:block">{user?.name || 'Patient'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'Patient'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      to="/patient/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Notification Modal */}
        {notificationModalOpen && selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setNotificationModalOpen(false)} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedNotification.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(selectedNotification.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
              <div className="p-4">
                <p className="text-gray-700 dark:text-gray-300">{selectedNotification.message}</p>
              </div>
              <div className="px-4 pb-4 flex justify-end">
                <button
                  onClick={() => setNotificationModalOpen(false)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
