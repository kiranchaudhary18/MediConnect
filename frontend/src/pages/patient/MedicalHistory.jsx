import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  Stethoscope, 
  Download, 
  Search, 
  Filter, 
  AlertCircle,
  FlaskConical,
  ClipboardList,
  X,
  Eye,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { getMedicalHistory } from '../../services/patientService';

const MedicalHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(['all']);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewModal, setViewModal] = useState(false);

  const originBase = useMemo(() => {
    const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return api.replace(/\/?api\/?$/, '');
  }, []);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      const data = await getMedicalHistory();
      const formatted = (data || []).map(record => {
        let normalizedType = 'report';
        if (record.type) {
          const t = record.type.toLowerCase();
          if (t === 'prescription') normalizedType = 'prescription';
          else if (t === 'lab test') normalizedType = 'lab';
          else if (t === 'report') normalizedType = 'report';
        }
        
        return {
          id: record._id,
          type: normalizedType,
          title: record.title || 'Untitled record',
          date: record.date || new Date().toISOString(),
          doctor: record.doctorName || 'Doctor',
          specialty: record.specialty || '',
          description: record.description || '',
          file: record.fileUrl || '#'
        };
      });

      setMedicalRecords(formatted);
    } catch (error) {
      console.error('Failed to fetch medical history', error);
      setMedicalRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const filteredRecords = useMemo(() => {
    let results = [...medicalRecords];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const safe = (value) => (value || '').toString().toLowerCase();
      results = results.filter(record =>
        safe(record.title).includes(query) ||
        safe(record.doctor).includes(query) ||
        safe(record.description).includes(query) ||
        safe(record.specialty).includes(query)
      );
    }
    
    if (!selectedTypes.includes('all') && selectedTypes.length > 0) {
      results = results.filter(record => selectedTypes.includes(record.type));
    }
    
    return results;
  }, [searchQuery, selectedTypes, medicalRecords]);

  const stats = {
    total: medicalRecords.length,
    prescriptions: medicalRecords.filter(r => r.type === 'prescription').length,
    labTests: medicalRecords.filter(r => r.type === 'lab').length,
    reports: medicalRecords.filter(r => r.type === 'report').length
  };

  const typeConfig = {
    prescription: {
      label: 'Prescription',
      icon: FileText,
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-400 to-indigo-500'
    },
    lab: {
      label: 'Lab Test',
      icon: FlaskConical,
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      gradient: 'from-emerald-400 to-green-500'
    },
    report: {
      label: 'Medical Report',
      icon: ClipboardList,
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      text: 'text-violet-600 dark:text-violet-400',
      gradient: 'from-violet-400 to-purple-500'
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDownload = (fileUrl) => {
    if (!fileUrl) return;
    const url = fileUrl.startsWith('/uploads') ? `${originBase}${fileUrl}` : fileUrl;
    window.open(url, '_blank');
  };

  const toggleTypeFilter = (type) => {
    if (type === 'all') {
      setSelectedTypes(['all']);
    } else {
      setSelectedTypes(prev => {
        const newTypes = prev.includes('all') ? [] : [...prev];
        if (newTypes.includes(type)) {
          const filtered = newTypes.filter(t => t !== type);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newTypes, type];
        }
      });
    }
  };

  const openRecord = (record) => {
    setSelectedRecord(record);
    setViewModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full animate-spin border-t-emerald-600" />
          <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical History</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View all your medical records and documents</p>
        </div>
        <button
          onClick={fetchMedicalHistory}
          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
              <FileText className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Prescriptions</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.prescriptions}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lab Tests</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.labTests}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <FlaskConical className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reports</p>
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-1">{stats.reports}</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30">
              <ClipboardList className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search records by title, doctor, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => toggleTypeFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                selectedTypes.includes('all')
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => toggleTypeFilter('prescription')}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all flex items-center ${
                selectedTypes.includes('prescription')
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Prescriptions
            </button>
            <button
              onClick={() => toggleTypeFilter('lab')}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all flex items-center ${
                selectedTypes.includes('lab')
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FlaskConical className="w-4 h-4 mr-1.5" />
              Lab Tests
            </button>
            <button
              onClick={() => toggleTypeFilter('report')}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all flex items-center ${
                selectedTypes.includes('report')
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <ClipboardList className="w-4 h-4 mr-1.5" />
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Records Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <FileText className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Records Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || !selectedTypes.includes('all')
              ? 'Try adjusting your search or filters'
              : 'Your medical records will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((record) => {
            const config = typeConfig[record.type] || typeConfig.report;
            const TypeIcon = config.icon;

            return (
              <div
                key={record.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Card Header */}
                <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
                
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${config.bg}`}>
                      <TypeIcon className={`w-6 h-6 ${config.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {record.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">
                    {record.description || 'No description available'}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Stethoscope className="w-4 h-4 mr-1.5" />
                      <span className="truncate max-w-[120px]">{record.doctor}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      {formatDate(record.date)}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openRecord(record)}
                      className="flex-1 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View
                    </button>
                    {record.file && record.file !== '#' && (
                      <button
                        onClick={() => handleDownload(record.file)}
                        className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-1.5" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      {viewModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className={`p-6 bg-gradient-to-r ${typeConfig[selectedRecord.type]?.gradient || 'from-emerald-500 to-green-600'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/20">
                    {(() => {
                      const TypeIcon = typeConfig[selectedRecord.type]?.icon || FileText;
                      return <TypeIcon className="w-6 h-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedRecord.title}</h3>
                    <p className="text-white/80 text-sm mt-1">
                      {typeConfig[selectedRecord.type]?.label || 'Record'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewModal(false)}
                  className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Doctor</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Stethoscope className="w-4 h-4 mr-2 text-emerald-500" />
                    {selectedRecord.doctor}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                    {formatDate(selectedRecord.date)}
                  </p>
                </div>
              </div>

              {selectedRecord.specialty && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Specialty</p>
                  <p className="text-gray-900 dark:text-white">{selectedRecord.specialty}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="text-gray-900 dark:text-white">
                  {selectedRecord.description || 'No description available'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                {selectedRecord.file && selectedRecord.file !== '#' && (
                  <button
                    onClick={() => handleDownload(selectedRecord.file)}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Document
                  </button>
                )}
                <button
                  onClick={() => setViewModal(false)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
