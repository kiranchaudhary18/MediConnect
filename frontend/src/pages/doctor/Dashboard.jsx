import { useState, useEffect } from 'react';
import { Users, Calendar, Stethoscope, Clock } from 'lucide-react';
import axios from 'axios';

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
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would make API calls here
        // const dashboardData = await axios.get('/api/doctor/dashboard');
        // const patientsData = await axios.get('/api/doctor/patients?limit=5');
        // const appointmentsData = await axios.get('/api/doctor/appointments?status=upcoming&limit=5');
        
        // Mock data for demonstration
        setTimeout(() => {
          setStats({
            totalPatients: 124,
            totalStudents: 89,
            totalAppointments: 45,
            pendingAppointments: 12
          });
          
          setRecentPatients([
            { id: 1, name: 'John Doe', age: 32, disease: 'Hypertension', lastVisit: '2023-10-25' },
            { id: 2, name: 'Jane Smith', age: 28, disease: 'Diabetes', lastVisit: '2023-10-24' },
            { id: 3, name: 'Robert Johnson', age: 45, disease: 'Asthma', lastVisit: '2023-10-23' },
            { id: 4, name: 'Emily Davis', age: 29, disease: 'Migraine', lastVisit: '2023-10-22' },
            { id: 5, name: 'Michael Brown', age: 52, disease: 'Arthritis', lastVisit: '2023-10-21' },
          ]);
          
          setUpcomingAppointments([
            { id: 1, patientName: 'John Doe', date: '2023-10-30', time: '09:30 AM', status: 'confirmed' },
            { id: 2, patientName: 'Sarah Wilson', date: '2023-10-30', time: '10:15 AM', status: 'confirmed' },
            { id: 3, patientName: 'David Lee', date: '2023-10-30', time: '11:00 AM', status: 'pending' },
            { id: 4, patientName: 'Emma Garcia', date: '2023-10-31', time: '02:00 PM', status: 'confirmed' },
            { id: 5, patientName: 'James Taylor', date: '2023-10-31', time: '03:30 PM', status: 'pending' },
          ]);
          
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setLoading(false);
        console.error('Error fetching dashboard data:', err);
      }
    };
    
    fetchDashboardData();
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
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome back, Dr. Smith! Here's what's happening with your practice today.
        </p>
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
            <a href="/doctor/patients" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              View all patients
            </a>
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
            <a href="/doctor/appointments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              View all appointments
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
