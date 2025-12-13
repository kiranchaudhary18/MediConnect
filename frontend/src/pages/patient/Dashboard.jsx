// import { useState, useEffect } from 'react';
// import { Calendar, Clock, Bell, Search, Menu, X, Home, User, Stethoscope, FileText, Settings, LogOut } from 'lucide-react';
// import { getPatientDashboard } from '../../services/patientService';

// export default function PatientDashboard() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [appointments, setAppointments] = useState([]);
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         // Mock data for now - replace with actual API call
//         const data = await getPatientDashboard();
//         setAppointments(data.appointments || [
//           { _id: '1', doctorId: { name: 'John Doe' }, date: '2023-06-15', time: '10:00 AM', status: 'upcoming', reason: 'Regular checkup' },
//           { _id: '2', doctorId: { name: 'Jane Smith' }, date: '2023-06-10', time: '2:30 PM', status: 'completed', reason: 'Follow up' },
//         ]);
//         setPrescriptions(data.prescriptions || [
//           { _id: '1', doctorId: { name: 'John Doe' }, diagnosis: 'Common cold', createdAt: '2023-06-01' },
//           { _id: '2', doctorId: { name: 'Jane Smith' }, diagnosis: 'Allergy medication', createdAt: '2023-05-25' },
//         ]);
//         setDoctors(data.doctors || [
//           { _id: '1', name: 'John Doe', specialization: 'Cardiologist', experience: '10 years' },
//           { _id: '2', name: 'Jane Smith', specialization: 'Dermatologist', experience: '8 years' },
//           { _id: '3', name: 'Robert Johnson', specialization: 'Neurologist', experience: '12 years' },
//         ]);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching dashboard data:', err);
//         setError('Failed to load dashboard data. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-100">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-100">
//         <div className="text-center p-6 bg-white rounded-lg shadow-md">
//           <p className="text-red-500 text-4xl mb-4">⚠️</p>
//           <p className="text-lg font-medium text-gray-800">Something went wrong</p>
//           <p className="text-gray-600 mt-2">{error}</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Mobile sidebar backdrop */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         ></div>
//       )}

//       {/* Sidebar */}
//       <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
//         <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
//           <div className="flex items-center">
//             <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">M</div>
//             <span className="ml-2 text-lg font-semibold text-gray-800">MediConnect</span>
//           </div>
//           <button 
//             className="lg:hidden text-gray-500 hover:text-gray-700"
//             onClick={() => setSidebarOpen(false)}
//           >
//             <X size={20} />
//           </button>
//         </div>
//         <nav className="mt-6 px-2">
//           <a href="#" className="flex items-center px-4 py-3 text-white bg-blue-600 rounded-lg">
//             <Home size={20} className="mr-3" />
//             <span>Dashboard</span>
//           </a>
//           <a href="#" className="flex items-center px-4 py-3 mt-2 text-gray-600 hover:bg-gray-100 rounded-lg">
//             <User size={20} className="mr-3" />
//             <span>My Profile</span>
//           </a>
//           <a href="#" className="flex items-center px-4 py-3 mt-2 text-gray-600 hover:bg-gray-100 rounded-lg">
//             <Stethoscope size={20} className="mr-3" />
//             <span>Appointments</span>
//           </a>
//           <a href="#" className="flex items-center px-4 py-3 mt-2 text-gray-600 hover:bg-gray-100 rounded-lg">
//             <FileText size={20} className="mr-3" />
//             <span>Medical Records</span>
//           </a>
//           <a href="#" className="flex items-center px-4 py-3 mt-2 text-gray-600 hover:bg-gray-100 rounded-lg">
//             <Settings size={20} className="mr-3" />
//             <span>Settings</span>
//           </a>
//           <a href="#" className="flex items-center px-4 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-lg">
//             <LogOut size={20} className="mr-3" />
//             <span>Logout</span>
//           </a>
//         </nav>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
//         {/* Top navigation */}
//         <header className="bg-white shadow-sm z-10">
//           <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
//             <button 
//               className="lg:hidden text-gray-500 hover:text-gray-700"
//               onClick={() => setSidebarOpen(true)}
//             >
//               <Menu size={24} />
//             </button>
            
//             <div className="relative flex-1 max-w-md mx-4">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search size={18} className="text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                 placeholder="Search..."
//               />
//             </div>
            
//             <div className="flex items-center">
//               <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
//                 <span className="sr-only">View notifications</span>
//                 <Bell size={24} />
//               </button>
//               <div className="ml-4 flex items-center">
//                 <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
//                   U
//                 </div>
//                 <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">User Name</span>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Main content area */}
//         <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6">
//           <div className="max-w-7xl mx-auto">
//             {/* Welcome section */}
//             <div className="mb-8">
//               <h1 className="text-2xl font-bold text-gray-900">Welcome back, User!</h1>
//               <p className="text-gray-600">Here's what's happening with your health today.</p>
//             </div>

//             {/* Stats cards */}
//             <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
//               <div className="bg-white overflow-hidden shadow rounded-lg">
//                 <div className="p-5">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
//                       <Calendar className="h-6 w-6 text-white" />
//                     </div>
//                     <div className="ml-5 w-0 flex-1">
//                       <dl>
//                         <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Appointments</dt>
//                         <dd className="flex items-baseline">
//                           <div className="text-2xl font-semibold text-gray-900">2</div>
//                         </dd>
//                       </dl>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white overflow-hidden shadow rounded-lg">
//                 <div className="p-5">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
//                       <FileText className="h-6 w-6 text-white" />
//                     </div>
//                     <div className="ml-5 w-0 flex-1">
//                       <dl>
//                         <dt className="text-sm font-medium text-gray-500 truncate">Prescriptions</dt>
//                         <dd className="flex items-baseline">
//                           <div className="text-2xl font-semibold text-gray-900">5</div>
//                         </dd>
//                       </dl>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white overflow-hidden shadow rounded-lg">
//                 <div className="p-5">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
//                       <Clock className="h-6 w-6 text-white" />
//                     </div>
//                     <div className="ml-5 w-0 flex-1">
//                       <dl>
//                         <dt className="text-sm font-medium text-gray-500 truncate">Pending Tests</dt>
//                         <dd className="flex items-baseline">
//                           <div className="text-2xl font-semibold text-gray-900">1</div>
//                         </dd>
//                       </dl>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white overflow-hidden shadow rounded-lg">
//                 <div className="p-5">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
//                       <User className="h-6 w-6 text-white" />
//                     </div>
//                     <div className="ml-5 w-0 flex-1">
//                       <dl>
//                         <dt className="text-sm font-medium text-gray-500 truncate">Active Doctors</dt>
//                         <dd className="flex items-baseline">
//                           <div className="text-2xl font-semibold text-gray-900">3</div>
//                         </dd>
//                       </dl>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Appointments section */}
//             <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
//               <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
//                 <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Appointments</h3>
//                 <p className="mt-1 text-sm text-gray-500">Your scheduled appointments with doctors.</p>
//               </div>
//               <div className="bg-white overflow-hidden">
//                 <ul className="divide-y divide-gray-200">
//                   {appointments.map((appointment) => (
//                     <li key={appointment._id} className="px-4 py-4 sm:px-6">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
//                             <User className="h-6 w-6 text-blue-600" />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">Dr. {appointment.doctorId?.name}</div>
//                             <div className="text-sm text-gray-500">
//                               {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
//                             </div>
//                           </div>
//                         </div>
//                         <div>
//                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             appointment.status === 'upcoming' ? 'bg-green-100 text-green-800' :
//                             appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
//                             'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {appointment.status}
//                           </span>
//                         </div>
//                       </div>
//                       {appointment.reason && (
//                         <div className="mt-2 text-sm text-gray-500">
//                           <span className="font-medium">Reason:</span> {appointment.reason}
//                         </div>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <div className="bg-gray-50 px-4 py-3 sm:px-6 text-right">
//                 <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
//                   View all appointments
//                 </a>
//               </div>
//             </div>

//             {/* Bottom grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Prescriptions */}
//               <div className="bg-white shadow overflow-hidden sm:rounded-lg">
//                 <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
//                   <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Prescriptions</h3>
//                   <p className="mt-1 text-sm text-gray-500">Your latest prescribed medications.</p>
//                 </div>
//                 <div className="bg-white overflow-hidden">
//                   <ul className="divide-y divide-gray-200">
//                     {prescriptions.map((prescription) => (
//                       <li key={prescription._id} className="px-4 py-4 sm:px-6">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
//                             <FileText className="h-5 w-5 text-green-600" />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">{prescription.diagnosis}</div>
//                             <div className="text-sm text-gray-500">
//                               Prescribed by Dr. {prescription.doctorId?.name} on {new Date(prescription.createdAt).toLocaleDateString()}
//                             </div>
//                           </div>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div className="bg-gray-50 px-4 py-3 sm:px-6 text-right">
//                   <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
//                     View all prescriptions
//                   </a>
//                 </div>
//               </div>

//               {/* Available Doctors */}
//               <div className="bg-white shadow overflow-hidden sm:rounded-lg">
//                 <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
//                   <h3 className="text-lg leading-6 font-medium text-gray-900">Available Doctors</h3>
//                   <p className="mt-1 text-sm text-gray-500">Specialists available for consultation.</p>
//                 </div>
//                 <div className="bg-white overflow-hidden">
//                   <ul className="divide-y divide-gray-200">
//                     {doctors.map((doctor) => (
//                       <li key={doctor._id} className="px-4 py-4 sm:px-6">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
//                             <User className="h-5 w-5 text-purple-600" />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">Dr. {doctor.name}</div>
//                             <div className="text-sm text-gray-500">
//                               {doctor.specialization} • {doctor.experience}
//                             </div>
//                           </div>
//                           <div className="ml-auto">
//                             <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
//                               Book
//                             </button>
//                           </div>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div className="bg-gray-50 px-4 py-3 sm:px-6 text-right">
//                   <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
//                     View all doctors
//                   </a>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }





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