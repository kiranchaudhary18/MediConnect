import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Home,
  Bot,
  User as UserIcon,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { name: 'Dashboard', icon: LayoutDashboard, path: `/${user?.role}/dashboard` },
    ];

    if (user?.role === 'doctor') {
      return [
        ...commonItems,
        { name: 'Appointments', icon: Calendar, path: '/doctor/appointments' },
        { name: 'Patients', icon: Users, path: '/doctor/patients' },
        { name: 'Prescriptions', icon: FileText, path: '/doctor/prescriptions' },
      ];
    } else if (user?.role === 'student') {
      return [
        ...commonItems,
        { name: 'Doctors', icon: Users, path: '/student/doctors' },
        { name: 'Patient Records', icon: FileText, path: '/student/patient-records' },
      ];
    } else if (user?.role === 'patient') {
      return [
        ...commonItems,
        { name: 'Book Appointment', icon: Calendar, path: '/patient/book-appointment' },
        { name: 'My Appointments', icon: Calendar, path: '/patient/appointments' },
        { name: 'Medical History', icon: FileText, path: '/patient/medical-history' },
      ];
    }
    return commonItems;
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`h-screen bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">MediConnect</h1>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          {isCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Link
          to="/profile"
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
            location.pathname === '/profile'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
        >
          <UserIcon className="h-5 w-5" />
          {!isCollapsed && <span>Profile</span>}
        </Link>

        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
