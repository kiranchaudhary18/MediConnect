import { useState, useEffect } from 'react';
import { Users, Calendar, Stethoscope, Clock } from 'lucide-react';
import { getDoctorDashboardStats, getDoctorPatients, getDoctorAppointments } from '../../services/patientService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalStudents: 0,
    totalAppointments: 0,
    pendingAppointments: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId;
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
          disease: '—',
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
        if (isMounted) setError('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    // Light polling for near real-time updates
    intervalId = setInterval(fetchDashboardData, 15000);
    return () => { isMounted = false; clearInterval(intervalId); };
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`p-6 rounded-xl shadow-sm ${color} text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-white bg-opacity-20">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of your patients and appointments</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Patients" 
          value={stats.totalPatients} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={Users} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Total Appointments" 
          value={stats.totalAppointments} 
          icon={Calendar} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Pending Appointments" 
          value={stats.pendingAppointments} 
          icon={Clock} 
          color="bg-yellow-500" 
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Patients */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">My Patients</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{patient.age} years • {patient.disease}</p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last visit: {patient.lastVisit}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
            <Link to="/doctor/patients" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              View all patients
            </Link>
          </div>
        </div>
        
        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Appointments</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{appointment.patientName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {appointment.date} • {appointment.time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 text-center">
            <Link to="/doctor/appointments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              View all appointments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
