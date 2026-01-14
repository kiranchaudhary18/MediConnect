import { useState, useEffect, useContext } from 'react';
import { BookOpen, CheckCircle, FileText, Stethoscope, TrendingUp, Clock, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { getAvailableDoctors, getStudentMedicalRecords } from '../../services/patientService';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [stats, setStats] = useState([
    { id: 1, name: 'Total Assignments', value: 0, icon: BookOpen, change: 'Loading...', color: 'teal' },
    { id: 2, name: 'Completed', value: 0, icon: CheckCircle, change: 'Loading...', color: 'emerald' },
    { id: 3, name: 'Doctors', value: 0, icon: Stethoscope, change: 'Loading...', color: 'cyan' },
    { id: 4, name: 'Patient Records', value: 0, icon: FileText, change: 'Loading...', color: 'sky' },
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

      const totalAssignments = recordsList.length;
      const completedAssignments = Math.floor(recordsList.length * 0.7);

      setStats([
        { id: 1, name: 'Total Assignments', value: totalAssignments, icon: BookOpen, change: 'Case studies to review', color: 'teal' },
        { id: 2, name: 'Completed', value: completedAssignments, icon: CheckCircle, change: `${totalAssignments > 0 ? Math.round((completedAssignments/totalAssignments)*100) : 0}% done`, color: 'emerald' },
        { id: 3, name: 'Doctors', value: doctorsList.length, icon: Stethoscope, change: 'Registered doctors', color: 'cyan' },
        { id: 4, name: 'Patient Records', value: recordsList.length, icon: FileText, change: 'Anonymized records', color: 'sky' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
      sky: 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400',
    };
    return colors[color] || colors.teal;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 rounded-2xl p-6 md:p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-teal-100">Welcome back!</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Hello, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-teal-100 max-w-xl">
            Track your learning progress and stay updated with your medical education journey. Explore case studies, connect with doctors, and enhance your knowledge.
          </p>
          <div className="flex gap-3 mt-6">
            <Link
              to="/student/assignments"
              className="px-5 py-2.5 bg-white text-teal-600 rounded-xl font-medium hover:bg-teal-50 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              View Assignments
            </Link>
            <Link
              to="/student/ai-learning"
              className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Learning
            </Link>
          </div>
        </div>
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}></div>
        </div>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${getColorClasses(stat.color)}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-emerald-500 text-sm">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">{stat.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Assignments */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Assignments</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Case studies assigned for review</p>
            </div>
            <Link to="/student/assignments" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {medicalRecords.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-teal-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No assignments yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">New case studies will be assigned soon</p>
              </div>
            ) : (
              medicalRecords.slice(0, 3).map((record, index) => (
                <div key={record._id || index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{record.diagnosis || 'Medical Case'}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {record.patientAge} yrs, {record.patientGender} • Dr. {record.doctorName}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-block px-2.5 py-1 text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
                        {record.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Case Studies */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Case Studies</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Anonymized patient records</p>
            </div>
            <Link to="/student/patient-records" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {medicalRecords.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-cyan-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No case studies available</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Records will appear after appointments</p>
              </div>
            ) : (
              medicalRecords.slice(0, 3).map((record, index) => (
                <div key={record._id || index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{record.diagnosis || 'Medical Case'}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(record.visitDate || record.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Dr. {record.doctorName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/student/doctors"
          className="group p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30 transition-colors">
              <Stethoscope className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Browse Doctors</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connect with mentors</p>
            </div>
          </div>
        </Link>

        <Link
          to="/student/patient-records"
          className="group p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 transition-colors">
              <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Patient Records</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Study anonymized cases</p>
            </div>
          </div>
        </Link>

        <Link
          to="/student/ai-learning"
          className="group p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
              <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get learning help</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
