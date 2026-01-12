import { useState, useEffect, useContext } from 'react';
import { BookOpen, CheckCircle, FileText, Stethoscope } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { getAvailableDoctors, getStudentMedicalRecords } from '../../services/patientService';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [stats, setStats] = useState([
    { id: 1, name: 'Total Assignments', value: 0, icon: BookOpen, change: 'Loading...' },
    { id: 2, name: 'Completed', value: 0, icon: CheckCircle, change: 'Loading...' },
    { id: 3, name: 'Doctors', value: 0, icon: Stethoscope, change: 'Loading...' },
    { id: 4, name: 'Patient Records', value: 0, icon: FileText, change: 'Loading...' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [doctorsRes, recordsRes] = await Promise.all([
        getAvailableDoctors(),
        getStudentMedicalRecords()
      ]);

      const doctorsList = doctorsRes.data || [];
      const recordsList = recordsRes.data || [];

      setDoctors(doctorsList);
      setMedicalRecords(recordsList);

      // Calculate assignments (based on case studies available for review)
      const totalAssignments = recordsList.length;
      const completedAssignments = Math.floor(recordsList.length * 0.7); // 70% completed (placeholder)

      // Update stats with real data
      setStats([
        { id: 1, name: 'Total Assignments', value: totalAssignments, icon: BookOpen, change: 'Case studies to review' },
        { id: 2, name: 'Completed', value: completedAssignments, icon: CheckCircle, change: `${totalAssignments > 0 ? Math.round((completedAssignments/totalAssignments)*100) : 0}% done` },
        { id: 3, name: 'Doctors', value: doctorsList.length, icon: Stethoscope, change: 'Registered doctors' },
        { id: 4, name: 'Patient Records', value: recordsList.length, icon: FileText, change: 'Anonymized records' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || 'Student'}! <span className="text-orange-500">👋</span>
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Track your learning progress and stay updated with your medical education journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-500">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registered Doctors */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Registered Doctors</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Learn from experienced medical professionals</p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {doctors.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No doctors registered yet
            </div>
          ) : (
            doctors.slice(0, 2).map((doctor) => (
              <div key={doctor._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={doctor.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=f97316&color=fff`}
                      alt={doctor.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dr. {doctor.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {doctor.specialization || 'General Medicine'} • {doctor.experience || '5+'} years experience
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                    Available
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        {doctors.length > 2 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-right">
            <a href="/student/doctors" className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
              View all {doctors.length} doctors →
            </a>
          </div>
        )}
      </div>

      {/* Recent Case Studies */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Case Studies</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Anonymized patient records for learning</p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {medicalRecords.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No case studies available yet. Records will appear when doctors complete appointments.
            </div>
          ) : (
            medicalRecords.slice(0, 2).map((record) => (
              <div key={record._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{record.diagnosis || 'Medical Case'}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Patient: {record.patientAge} years, {record.patientGender} • Dr. {record.doctorName}
                    </p>
                    {record.summary && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {record.summary}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(record.visitDate || record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {medicalRecords.length > 2 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-right">
            <a href="/student/patient-records" className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
              View all {medicalRecords.length} case studies →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
