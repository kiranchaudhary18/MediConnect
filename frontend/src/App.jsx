import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SymptomChecker from './pages/SymptomChecker'
import { Toaster } from 'react-hot-toast'

// Doctor Pages
import DoctorLayout from './layouts/DoctorLayout';
import DoctorDashboard from './pages/doctor/Dashboard';
import Appointments from './pages/doctor/Appointments';
import Patients from './pages/doctor/Patients';
import Prescriptions from './pages/doctor/Prescriptions';

// Patient Pages
import PatientLayout from './layouts/PatientLayout';
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/Appointments';
import MedicalHistory from './pages/patient/MedicalHistory';
import Profile from './pages/Profile';

// Student Pages
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import StudentDoctors from './pages/student/Doctors';
import PatientRecords from './pages/student/PatientRecords';

// Public route wrapper that redirects to dashboard if user is logged in
const PublicRoute = () => {
  const { user } = useAuth()
  
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }
  
  return <Outlet />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'dark:bg-gray-800 dark:text-white',
                success: {
                  className: '!bg-green-100 dark:!bg-green-900 !text-green-700 dark:!text-green-100',
                  iconTheme: {
                    primary: '#10B981',
                    secondary: 'white',
                  },
                },
                error: {
                  className: '!bg-red-100 dark:!bg-red-900 !text-red-700 dark:!text-red-100',
                },
              }}
            />
            <SocketProvider>
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>
                
                <Route path="/" element={<Home />} />
                <Route path="/symptom-checker" element={<SymptomChecker />} />
                
                {/* Protected Profile Route */}
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
                
                {/* Patient Routes */}
                <Route path="/patient" element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <PatientLayout />
                  </PrivateRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<PatientDashboard />} />
                  <Route path="book-appointment" element={<BookAppointment />} />
                  <Route path="appointments" element={<PatientAppointments />} />
                  <Route path="medical-history" element={<MedicalHistory />} />
                  <Route path="chat" element={<div className="p-6">Chat with Doctor (Coming Soon)</div>} />
                  <Route path="health-tracker" element={<div className="p-6">Health Tracker (Coming Soon)</div>} />
                  <Route path="feedback" element={<div className="p-6">Feedback (Coming Soon)</div>} />
                </Route>
                
                {/* Doctor Routes */}
                <Route path="/doctor" element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorLayout />
                  </PrivateRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DoctorDashboard />} />
                  <Route path="appointments" element={<Appointments />} />
                  <Route path="patients" element={<Patients />} />
                  <Route path="prescriptions" element={<Prescriptions />} />
                </Route>
                
                {/* Student Routes */}
                <Route path="/student" element={
                  <PrivateRoute allowedRoles={['student']}>
                    <StudentLayout />
                  </PrivateRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="doctors" element={<StudentDoctors />} />
                  <Route path="patient-records" element={<PatientRecords />} />
                  <Route path="assignments" element={<div className="p-6">Assignments (Coming Soon)</div>} />
                  <Route path="ai-learning" element={<div className="p-6">AI Learning (Coming Soon)</div>} />
                  <Route path="community" element={<div className="p-6">Community (Coming Soon)</div>} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <Toaster position="top-right" />
            </SocketProvider>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

