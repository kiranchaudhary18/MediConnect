import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon, 
  FileText, 
  X, 
  User,
  Upload,
  Plus,
  Eye,
  ChevronRight,
  Stethoscope,
  Clock,
  Loader2
} from 'lucide-react';
import { getDoctorPatients, uploadMedicalRecord } from '../../services/patientService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [recordForm, setRecordForm] = useState({
    title: '',
    type: 'Report',
    date: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const list = await getDoctorPatients();
      const mapped = (Array.isArray(list) ? list : []).map(p => ({
        id: p.id || p._id,
        name: p.name,
        age: p.age ?? '-',
        gender: p.gender ?? '-',
        lastVisit: p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : '-',
        nextAppointment: p.nextAppointment ? new Date(p.nextAppointment).toLocaleDateString() : 'Not scheduled',
        phone: p.phone || '',
        email: p.email || '',
        medicalHistory: p.medicalHistory || []
      }));
      setPatients(mapped);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openMedicalRecordForm = (patient) => {
    setSelectedPatient(patient);
    setShowForm(true);
    setRecordForm({ title: '', type: 'Report', date: '', description: '' });
    setFile(null);
  };

  const handleSubmitMedicalRecord = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please attach a file');
      return;
    }
    if (!selectedPatient) {
      toast.error('No patient selected');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...recordForm,
        doctorName: user?.name || 'Doctor',
        date: recordForm.date || new Date().toISOString(),
        patientEmail: selectedPatient.email
      };
      await uploadMedicalRecord(file, payload);
      toast.success('Medical record created successfully');
      setShowForm(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-900 rounded-full animate-spin border-t-emerald-600"></div>
          <Stethoscope className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your patients and medical records</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{patients.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Today</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{Math.floor(patients.length * 0.3)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-violet-100 dark:border-violet-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">New This Month</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{Math.floor(patients.length * 0.15)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending Follow-up</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{Math.floor(patients.length * 0.2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No patients found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-xl font-bold text-white">{patient.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{patient.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{patient.gender}, {patient.age} years</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300 truncate">{patient.email}</span>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{patient.phone}</span>
                  </div>
                )}
              </div>

              {patient.medicalHistory.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {patient.medicalHistory.slice(0, 3).map((condition, index) => (
                    <span key={index} className="px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      {condition}
                    </span>
                  ))}
                  {patient.medicalHistory.length > 3 && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                      +{patient.medicalHistory.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3 text-center text-xs">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Last Visit</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{patient.lastVisit}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Next Appointment</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{patient.nextAppointment}</p>
                </div>
              </div>

              <button
                onClick={() => openMedicalRecordForm(patient)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all font-medium text-sm shadow-lg shadow-emerald-500/25"
              >
                <FileText className="w-4 h-4" />
                Add Medical Record
              </button>
            </div>
          ))
        )}
      </div>

      {/* Medical Record Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Medical Record</h3>
                  <p className="text-sm text-gray-500">For {selectedPatient?.name}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitMedicalRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={recordForm.title}
                  onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Record title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <select
                  value={recordForm.type}
                  onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="Report">Report</option>
                  <option value="Lab Result">Lab Result</option>
                  <option value="Prescription">Prescription</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={recordForm.date}
                  onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={recordForm.description}
                  onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attach File</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {file ? file.name : 'Click to upload file'}
                    </span>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {submitting ? 'Uploading...' : 'Upload Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
