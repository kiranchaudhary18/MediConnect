import { useState, useEffect } from 'react';
import { Calendar, HeartPulse, Activity, Droplets, Scale, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const healthData = [
  { name: 'Mon', bp: 120, sugar: 90, weight: 70 },
  { name: 'Tue', bp: 125, sugar: 95, weight: 70.2 },
  { name: 'Wed', bp: 118, sugar: 100, weight: 69.8 },
  { name: 'Thu', bp: 130, sugar: 105, weight: 70.1 },
  { name: 'Fri', bp: 128, sugar: 98, weight: 69.9 },
  { name: 'Sat', bp: 122, sugar: 92, weight: 70 },
  { name: 'Sun', bp: 120, sugar: 88, weight: 69.8 },
];

export default function PatientDashboard() {
  const [loading, setLoading] = useState(true);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState({
    bloodPressure: '120/80',
    sugarLevel: '92 mg/dL',
    weight: '70 kg',
    bmi: '23.5'
  });

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        // In a real app: const response = await axios.get('/api/patient/dashboard');
        setTimeout(() => {
          setNextAppointment({
            id: 1,
            doctorName: 'Dr. Sarah Johnson',
            specialization: 'Cardiologist',
            date: '2023-11-05',
            time: '10:30 AM',
            status: 'Confirmed'
          });
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg text-white p-6">
        <h1 className="text-2xl font-bold">Welcome back, John! 👋</h1>
        <p className="mt-2 text-green-100">Here's what's happening with your health today.</p>
      </div>
      
      {/* Next Appointment */}
      {nextAppointment && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Next Appointment</h2>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                {nextAppointment.status}
              </span>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-300 text-lg font-medium">
                    {nextAppointment.doctorName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{nextAppointment.doctorName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{nextAppointment.specialization}</p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(nextAppointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{nextAppointment.time}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Join Video Call
                </button>
                <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Health Summary */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Health Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Blood Pressure" 
            value={healthMetrics.bloodPressure} 
            icon={Activity} 
            color="text-red-500"
          />
          <StatCard 
            title="Sugar Level" 
            value={healthMetrics.sugarLevel} 
            icon={Droplets} 
            color="text-blue-500"
          />
          <StatCard 
            title="Weight" 
            value={healthMetrics.weight} 
            icon={Scale} 
            color="text-yellow-500"
          />
          <StatCard 
            title="BMI" 
            value={healthMetrics.bmi} 
            icon={HeartPulse} 
            color="text-green-500"
          />
        </div>
      </div>
      
      {/* Health Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Health Trends</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={healthData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="bp" name="Blood Pressure" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="sugar" name="Sugar Level" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {[
              { id: 1, type: 'appointment', title: 'Appointment Confirmed', description: 'Your appointment with Dr. Sarah Johnson is confirmed for Nov 5, 10:30 AM', time: '2 hours ago' },
              { id: 2, type: 'prescription', title: 'New Prescription', description: 'Dr. Johnson has updated your prescription', time: '1 day ago' },
              { id: 3, type: 'test', title: 'Test Results', description: 'Your recent blood test results are available', time: '3 days ago' },
            ].map((activity) => (
              <div key={activity.id} className="flex items-start pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  {activity.type === 'appointment' && <Calendar className="h-5 w-5 text-green-600 dark:text-green-300" />}
                  {activity.type === 'prescription' && <FileText className="h-5 w-5 text-green-600 dark:text-green-300" />}
                  {activity.type === 'test' && <Activity className="h-5 w-5 text-green-600 dark:text-green-300" />}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
