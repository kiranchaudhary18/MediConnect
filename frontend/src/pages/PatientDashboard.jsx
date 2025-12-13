// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { 
//   LayoutDashboard, 
//   Calendar, 
//   Stethoscope, 
//   FileText, 
//   User, 
//   LogOut,
//   Video,
//   CalendarClock,
//   Activity,
//   Clock,
//   CheckCircle2
// } from 'lucide-react';

// const PatientDashboard = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [appointments, setAppointments] = useState([]);
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [apps, prescs, docs] = await Promise.all([
//         axios.get('/api/patient/appointments'),
//         axios.get('/api/patient/prescriptions'),
//         axios.get('/api/patient/doctors')
//       ]);
//       setAppointments(apps.data);
//       setPrescriptions(prescs.data);
//       setDoctors(docs.data);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Mock data - replace with actual API calls
//   const userData = {
//     name: 'John',
//     nextAppointment: appointments[0] || {
//       doctor: doctors[0]?.name || 'Dr. Sarah Johnson',
//       date: 'Tuesday, November 7, 2023',
//       time: '10:00 AM',
//       type: 'Video Consultation'
//     },
//     healthStats: {
//       bloodPressure: '120/80',
//       sugarLevel: '92 mg/dL',
//       weight: '70 kg',
//       bmi: '23.5'
//     },
//     recentActivities: [
//       { id: 1, type: 'Appointment Confirmed', time: '2 hours ago', icon: '✓' },
//       { id: 2, type: 'New Prescription', time: '1 day ago', icon: '📝' },
//       { id: 3, type: 'Test Results', time: '3 days ago', icon: '📊' }
//     ]
//   };

//   const handleLogout = () => {
//     // Handle logout logic here
//     navigate('/login');
//   };

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'dashboard':
//         return (
//           <div className="space-y-6">
//             {/* Welcome Section */}
//             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
//               <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
//                 Welcome back, {userData.name}!
//               </h1>
//               <p className="text-gray-600 dark:text-gray-300">Here's what's happening with your health today.</p>
//             </div>

//             {/* Next Appointment */}
//             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Next Appointment</h2>
//                 <span className="text-sm text-green-600 dark:text-green-400">Upcoming</span>
//               </div>
              
//               <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg mb-4">
//                 <div className="flex items-start space-x-4">
//                   <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
//                     <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-300" />
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-gray-800 dark:text-white">{userData.nextAppointment.doctor}</h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-300">{userData.nextAppointment.type}</p>
//                   </div>
//                 </div>
                
//                 <div className="mt-4 flex flex-wrap gap-3">
//                   <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
//                     <CalendarClock className="h-4 w-4 mr-1.5 text-green-600 dark:text-green-400" />
//                     {userData.nextAppointment.date}
//                   </div>
//                   <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
//                     <Clock className="h-4 w-4 mr-1.5 text-green-600 dark:text-green-400" />
//                     {userData.nextAppointment.time}
//                   </div>
//                 </div>
                
//                 <div className="mt-4 flex space-x-3">
//                   <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2">
//                     <Video className="h-4 w-4" />
//                     <span>Join Video Call</span>
//                   </button>
//                   <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
//                     Reschedule
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Health Summary */}
//             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
//               <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Health Summary</h2>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <HealthStatCard 
//                   title="Blood Pressure" 
//                   value={userData.healthStats.bloodPressure} 
//                   icon={<Activity className="h-5 w-5" />} 
//                   color="green"
//                 />
//                 <HealthStatCard 
//                   title="Sugar Level" 
//                   value={userData.healthStats.sugarLevel} 
//                   icon={<Activity className="h-5 w-5" />} 
//                   color="green"
//                 />
//                 <HealthStatCard 
//                   title="Weight" 
//                   value={userData.healthStats.weight} 
//                   icon={<Activity className="h-5 w-5" />} 
//                   color="green"
//                 />
//                 <HealthStatCard 
//                   title="BMI" 
//                   value={userData.healthStats.bmi} 
//                   icon={<Activity className="h-5 w-5" />} 
//                   color="green"
//                 />
//               </div>
//             </div>

//             {/* Health Trends and Recent Activities */}
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Health Trends */}
//               <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
//                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Health Trends</h2>
//                 <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
//                   <p className="text-gray-500 dark:text-gray-400">Blood Pressure & Sugar Level Chart</p>
//                 </div>
//                 <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
//                   <span>Mon</span>
//                   <span>Tue</span>
//                   <span>Wed</span>
//                   <span>Thu</span>
//                   <span>Fri</span>
//                   <span>Sat</span>
//                   <span>Sun</span>
//                 </div>
//               </div>

//               {/* Recent Activities */}
//               <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
//                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Activities</h2>
//                 <div className="space-y-4">
//                   {userData.recentActivities.map(activity => (
//                     <div key={activity.id} className="flex items-start">
//                       <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-3">
//                         <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.type}</p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       // Add cases for other tabs as needed
//       default:
//         return <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">Content for {activeTab}</div>;
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
//       {/* Sidebar */}
//       <div className="w-64 bg-gray-800 text-white">
//         <div className="p-6">
//           <h1 className="text-xl font-bold text-green-400">MediConnect</h1>
//           <p className="text-sm text-gray-400">Patient Portal</p>
//         </div>
        
//         <nav className="mt-6">
//           <NavItem 
//             icon={<LayoutDashboard className="h-5 w-5" />} 
//             text="Dashboard" 
//             active={activeTab === 'dashboard'}
//             onClick={() => setActiveTab('dashboard')}
//           />
//           <NavItem 
//             icon={<Calendar className="h-5 w-5" />} 
//             text="Book Appointment" 
//             active={activeTab === 'book'}
//             onClick={() => setActiveTab('book')}
//           />
//           <NavItem 
//             icon={<FileText className="h-5 w-5" />} 
//             text="My Appointments" 
//             active={activeTab === 'appointments'}
//             onClick={() => setActiveTab('appointments')}
//           />
//           <NavItem 
//             icon={<Stethoscope className="h-5 w-5" />} 
//             text="Medical History" 
//             active={activeTab === 'history'}
//             onClick={() => setActiveTab('history')}
//           />
//         </nav>
        
//         <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
//           <NavItem 
//             icon={<User className="h-5 w-5" />} 
//             text="Profile" 
//             active={activeTab === 'profile'}
//             onClick={() => setActiveTab('profile')}
//           />
//           <button 
//             onClick={handleLogout}
//             className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors duration-200"
//           >
//             <LogOut className="h-5 w-5 mr-3" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </div>
      
//       {/* Main Content */}
//       <div className="flex-1 overflow-y-auto p-6">
//         {loading ? (
//           <div className="flex items-center justify-center h-full">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//           </div>
//         ) : (
//           renderContent()
//         )}
//       </div>
//     </div>
//   );
// };

// // Reusable Nav Item Component
// const NavItem = ({ icon, text, active, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`flex items-center w-full px-4 py-3 text-left ${
//       active 
//         ? 'bg-gray-700 text-green-400' 
//         : 'text-gray-300 hover:bg-gray-700 hover:text-white'
//     } rounded-lg transition-colors duration-200 mb-1`}
//   >
//     <span className="mr-3">{icon}</span>
//     <span className="font-medium">{text}</span>
//   </button>
// );

// // Health Stat Card Component
// const HealthStatCard = ({ title, value, icon, color }) => {
//   const colorClasses = {
//     green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
//   };

//   return (
//     <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
//       <div className={`h-10 w-10 rounded-full ${colorClasses[color]} flex items-center justify-center mb-2`}>
//         {icon}
//       </div>
//       <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
//       <p className="text-lg font-semibold text-gray-800 dark:text-white">{value}</p>
//     </div>
//   );
// };

// export default PatientDashboard;
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
//         <h1 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8 dark:text-white">Patient Dashboard</h1>
        
//         {loading ? (
//           <div className="text-center py-12">Loading...</div>
//         ) : (
//           <div className="grid gap-6 lg:grid-cols-2">
//             <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
//               <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">My Appointments</h2>
//               {appointments.length === 0 ? (
//                 <p className="text-gray-500 text-sm">No appointments yet</p>
//               ) : (
//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {appointments.map(apt => (
//                     <div key={apt._id} className="border-b pb-3 dark:border-gray-700">
//                       <p className="font-semibold dark:text-white text-sm sm:text-base">{apt.doctorId?.name}</p>
//                       <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
//                         {new Date(apt.date).toLocaleDateString()} at {apt.time}
//                       </p>
//                       <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
//                         apt.status === 'approved' ? 'bg-green-100 text-green-800' :
//                         apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
//                       }`}>
//                         {apt.status}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
//               <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">Prescriptions</h2>
//               {prescriptions.length === 0 ? (
//                 <p className="text-gray-500 text-sm">No prescriptions yet</p>
//               ) : (
//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {prescriptions.slice(0, 5).map(presc => (
//                     <div key={presc._id} className="border-b pb-3 dark:border-gray-700">
//                       <p className="font-semibold dark:text-white text-sm sm:text-base">Dr. {presc.doctorId?.name}</p>
//                       <p className="text-sm text-gray-600 dark:text-gray-400">{presc.diagnosis}</p>
//                       <p className="text-xs text-gray-500 mt-1">{new Date(presc.createdAt).toLocaleDateString()}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow lg:col-span-2">
//               <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">Available Doctors</h2>
//               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                 {doctors.length === 0 ? (
//                   <p className="text-gray-500">No doctors available</p>
//                 ) : (
//                   doctors.map(doctor => (
//                     <div key={doctor._id} className="border p-3 sm:p-4 rounded-lg hover:shadow-md transition">
//                       <p className="font-semibold dark:text-white">Dr. {doctor.name}</p>
//                       <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.specialization}</p>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default PatientDashboard









