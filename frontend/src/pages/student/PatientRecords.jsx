import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Download, User, Calendar, Info, X, Stethoscope, Activity, Clock, Eye } from 'lucide-react';
import { getStudentMedicalRecords } from '../../services/patientService';

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const diseases = ['all', ...new Set(records.map(record => record.disease).filter(Boolean))];
  const doctors = ['all', ...new Set(records.map(record => record.doctor).filter(Boolean))];

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await getStudentMedicalRecords();
        const data = response?.data || response || [];
        const mapped = (Array.isArray(data) ? data : []).map(record => ({
          id: record.id || record._id,
          age: record.patientAge || record.age,
          gender: record.patientGender || record.gender,
          disease: record.diagnosis || record.disease,
          treatment: record.treatment,
          doctor: record.doctorName || record.doctor,
          specialization: record.specialization,
          date: record.visitDate || record.date || record.createdAt,
          status: record.status,
          notes: record.summary || record.notes,
          type: record.type
        }));
        setRecords(mapped);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.disease?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.treatment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDisease = diseaseFilter === 'all' || record.disease === diseaseFilter;
    const matchesDoctor = doctorFilter === 'all' || record.doctor === doctorFilter;
    
    return matchesSearch && matchesDisease && matchesDoctor;
  });

  const openRecordModal = (record) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
  };

  const exportToCSV = () => {
    const headers = ['Patient ID', 'Age', 'Gender', 'Disease', 'Treatment', 'Doctor', 'Date', 'Status'];
    const csvData = filteredRecords.map(r => [
      r.id, r.age, r.gender, r.disease, r.treatment?.replace(/,/g, ';'), r.doctor, r.date, r.status
    ]);
    const csv = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patient_records.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            Patient Records
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Anonymized case studies for learning</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          {/* Disease Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              className="w-full sm:w-40 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 appearance-none"
            >
              {diseases.map((disease) => (
                <option key={disease} value={disease}>
                  {disease === 'all' ? 'All Diseases' : disease}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full sm:w-40 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 appearance-none"
            >
              {doctors.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor === 'all' ? 'All Doctors' : `Dr. ${doctor}`}
                </option>
              ))}
            </select>
          </div>

          {/* Export */}
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{records.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Records</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{diseases.length - 1}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Conditions</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{doctors.length - 1}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Doctors</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
              <Eye className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredRecords.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Filtered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Records Grid */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No records found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 group cursor-pointer"
              onClick={() => openRecordModal(record)}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                        {record.disease || 'Medical Case'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {record.age} yrs • {record.gender}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                    record.status === 'completed' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {record.status || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Stethoscope className="w-4 h-4 text-teal-500" />
                  <span className="truncate">Dr. {record.doctor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  <span>{new Date(record.date).toLocaleDateString()}</span>
                </div>
                {record.treatment && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {record.treatment}
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50">
                <button className="w-full py-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Details Modal */}
      {modalOpen && selectedRecord && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedRecord.disease || 'Medical Case'}</h2>
                  <p className="text-teal-100">Patient Record: #{selectedRecord.id?.slice(-8)}</p>
                  <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-lg ${
                    selectedRecord.status === 'completed' 
                      ? 'bg-white/20 text-white'
                      : 'bg-yellow-400/20 text-yellow-100'
                  }`}>
                    {selectedRecord.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Patient Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <User className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Age / Gender</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRecord.age} years, {selectedRecord.gender}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <Activity className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Diagnosis</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRecord.disease}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <Stethoscope className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Doctor</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Dr. {selectedRecord.doctor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <Calendar className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Treatment & Notes */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Case Summary</h3>
                  
                  {selectedRecord.treatment && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Treatment</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRecord.treatment}</p>
                    </div>
                  )}
                  
                  {selectedRecord.notes && (
                    <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-100 dark:border-teal-900/30">
                      <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-2">AI-Generated Summary</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 pt-0">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl transition-colors shadow-lg shadow-teal-500/25"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
