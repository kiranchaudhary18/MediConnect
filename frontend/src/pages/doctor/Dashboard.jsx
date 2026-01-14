import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  ArrowRight,
  Stethoscope,
  GraduationCap,
  Activity,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { getDoctorDashboardStats, getDoctorPatients, getDoctorAppointments } from '../../services/patientService';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalStudents: 0,
    totalAppointments: 0,
    pendingAppointments: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const [statsRes, patientsRes, aptsRes] = await Promise.all([
          getDoctorDashboardStats(),
          getDoctorPatients(),
          getDoctorAppointments()
        ]);

        if (!isMounted) return;
        setStats({
          totalPatients: statsRes?.totalPatients || 0,
          totalStudents: statsRes?.totalStudents || 0,
          totalAppointments: statsRes?.totalAppointments || 0,
          pendingAppointments: statsRes?.pendingAppointments || 0
        });

        const rp = (Array.isArray(patientsRes) ? patientsRes : []).slice(0, 5).map(p => ({
          id: p.id || p._id,
          name: p.name,
          age: p.age ?? '-',
          email: p.email || '',
          lastVisit: p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : '-'
        }));
        setRecentPatients(rp);

        const now = new Date();
        const ua = (Array.isArray(aptsRes) ? aptsRes : [])
          .filter(a => ['pending', 'confirmed'].includes(a.status))
          .filter(a => a.date && new Date(a.date) >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5)
          .map(a => ({
            id: a._id,
            patientName: a.patient?.name || 'Unknown',
            date: new Date(a.date).toLocaleDateString(),
            time: a.time,
            status: a.status
          }));
        setUpcomingAppointments(ua);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 15000);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-200 dark:border-violet-900 rounded-full animate-spin border-t-violet-600"></div>
          <Stethoscope className="w-6 h-6 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Patients', 
      value: stats.totalPatients, 
      icon: Users, 
      gradient: 'from-blue-500 to-cyan-400',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      iconBg: 'bg-blue-500',
      change: '+12%',
      positive: true
    },
    { 
      title: 'Students', 
      value: stats.totalStudents, 
      icon: GraduationCap, 
      gradient: 'from-violet-500 to-purple-400',
      bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
      iconBg: 'bg-violet-500',
      change: '+5%',
      positive: true
    },
    { 
      title: 'Appointments', 
      value: stats.totalAppointments, 
      icon: Calendar, 
      gradient: 'from-emerald-500 to-teal-400',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
      iconBg: 'bg-emerald-500',
      change: '+8%',
      positive: true
    },
    { 
      title: 'Pending', 
      value: stats.pendingAppointments, 
      icon: Clock, 
      gradient: 'from-amber-500 to-orange-400',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      iconBg: 'bg-amber-500',
      change: '-3%',
      positive: false
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 lg:p-8">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-violet-200 text-sm font-medium mb-1">{getGreeting()}</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Dr. {user?.name || 'Doctor'}</h1>
              <p className="text-violet-200 mt-2 text-sm">Here's what's happening with your practice today.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/doctor/appointments"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-medium transition-all"
              >
                <Calendar className="w-4 h-4" />
                View Schedule
              </Link>
            </div>
          </div>

          {/* Quick Stats in Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-violet-200 text-xs font-medium">Today's Appointments</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.pendingAppointments}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-violet-200 text-xs font-medium">Total Patients</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalPatients}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-violet-200 text-xs font-medium">Active Students</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalStudents}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-violet-200 text-xs font-medium">Completion Rate</p>
              <p className="text-2xl font-bold text-white mt-1">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xs font-medium ${stat.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl`}></div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your scheduled consultations</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No upcoming appointments</p>
              </div>
            ) : (
              upcomingAppointments.map((apt, index) => (
                <div key={apt.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {apt.patientName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{apt.patientName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{apt.date} • {apt.time}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      apt.status === 'confirmed' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Link
            to="/doctor/appointments"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-violet-600 dark:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-800 font-medium text-sm"
          >
            View All Appointments
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Recent Patients */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Patients</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Patients you've treated recently</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentPatients.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No recent patients</p>
              </div>
            ) : (
              recentPatients.map((patient, index) => (
                <div key={patient.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{patient.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{patient.age} years old</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Last Visit</p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{patient.lastVisit}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Link
            to="/doctor/patients"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-800 font-medium text-sm"
          >
            View All Patients
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/doctor/appointments"
          className="group p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-500/5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Appointments</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage schedule</p>
        </Link>

        <Link
          to="/doctor/patients"
          className="group p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Patients</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View patient list</p>
        </Link>

        <Link
          to="/doctor/students"
          className="group p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Students</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage students</p>
        </Link>

        <Link
          to="/doctor/health-tips"
          className="group p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg hover:shadow-amber-500/5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Health Tips</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Share knowledge</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
