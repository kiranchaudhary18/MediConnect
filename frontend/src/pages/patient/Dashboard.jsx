import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Stethoscope,
  Activity,
  Heart,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  User,
  MessageSquare,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPatientDashboard } from '../../services/patientService';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    appointments: [],
    prescriptions: [],
    doctors: [],
    healthMetrics: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPatientDashboard();
        setDashboardData({
          appointments: data.appointments || [],
          prescriptions: data.prescriptions || [],
          doctors: data.doctors || [],
          healthMetrics: data.healthMetrics || null
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingAppointments = dashboardData.appointments.filter(
    a => a.status === 'pending' || a.status === 'confirmed'
  ).slice(0, 3);

  const stats = [
    {
      title: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      icon: Calendar,
      color: 'from-emerald-400 to-green-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      link: '/patient/appointments'
    },
    {
      title: 'Active Prescriptions',
      value: dashboardData.prescriptions.length,
      icon: FileText,
      color: 'from-cyan-400 to-teal-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      link: '/patient/medical-history'
    },
    {
      title: 'My Doctors',
      value: dashboardData.doctors.length,
      icon: Stethoscope,
      color: 'from-violet-400 to-purple-500',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20',
      link: '/patient/appointments'
    },
    {
      title: 'Health Score',
      value: '85%',
      icon: Heart,
      color: 'from-rose-400 to-pink-500',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      link: '/patient/medical-history'
    }
  ];

  const quickActions = [
    { title: 'Book Appointment', icon: Plus, link: '/patient/book-appointment', color: 'emerald' },
    { title: 'View Records', icon: FileText, link: '/patient/medical-history', color: 'cyan' },
    { title: 'Chat with Doctor', icon: MessageSquare, link: '/patient/chat', color: 'violet' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full animate-spin border-t-emerald-600" />
          <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-8 text-white shadow-2xl shadow-emerald-500/25">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm mb-4">
              <Heart className="w-4 h-4 mr-2" />
              Your Health Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Patient'}! 👋
            </h1>
            <p className="text-emerald-100 text-lg max-w-xl">
              Track your health, manage appointments, and stay connected with your healthcare providers.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex items-center space-x-3">
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity rounded-full -translate-y-16 translate-x-16" />
            
            <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-4`}>
              <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ color: 'currentColor' }} />
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
              </div>
              <Link
                to="/patient/appointments"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium flex items-center"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Upcoming Appointments</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Schedule your next checkup today!</p>
                <Link
                  to="/patient/book-appointment"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Book Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <div
                    key={appointment._id || index}
                    className="flex items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/25">
                      {(appointment.doctorId?.name || appointment.doctorName || 'D')[0]}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        Dr. {appointment.doctorId?.name || appointment.doctorName || 'Unknown'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(appointment.date).toLocaleDateString()}
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        {appointment.time}
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {appointment.status === 'confirmed' ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</>
                        ) : (
                          <><AlertCircle className="w-3 h-3 mr-1" /> Pending</>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`flex items-center p-4 rounded-xl transition-all group hover:shadow-md ${
                  action.color === 'emerald' ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20' :
                  action.color === 'cyan' ? 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20' :
                  action.color === 'violet' ? 'hover:bg-violet-50 dark:hover:bg-violet-900/20' :
                  'hover:bg-rose-50 dark:hover:bg-rose-900/20'
                }`}
              >
                <div className={`p-3 rounded-xl ${
                  action.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  action.color === 'cyan' ? 'bg-cyan-100 dark:bg-cyan-900/30' :
                  action.color === 'violet' ? 'bg-violet-100 dark:bg-violet-900/30' :
                  'bg-rose-100 dark:bg-rose-900/30'
                }`}>
                  <action.icon className={`w-5 h-5 ${
                    action.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                    action.color === 'cyan' ? 'text-cyan-600 dark:text-cyan-400' :
                    action.color === 'violet' ? 'text-violet-600 dark:text-violet-400' :
                    'text-rose-600 dark:text-rose-400'
                  }`} />
                </div>
                <span className="ml-4 font-medium text-gray-900 dark:text-white flex-1">{action.title}</span>
                <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Health Tips */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/25">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Daily Health Tip</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Stay hydrated! Drinking 8 glasses of water daily helps maintain energy levels and supports your immune system. 💧
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
