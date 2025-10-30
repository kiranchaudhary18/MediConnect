import { useState, useEffect } from 'react';
import { FileText, Calendar, Stethoscope, Download, Search, Filter, AlertCircle } from 'lucide-react';

const MedicalHistory = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(['all']);

  // Mock data for medical records
  const mockRecords = [
    {
      id: 1,
      type: 'prescription',
      title: 'Prescription - Dr. Sarah Johnson',
      date: '2023-10-15',
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      description: 'Medication for blood pressure management',
      file: 'prescription_10152023.pdf',
    },
    {
      id: 2,
      type: 'lab',
      title: 'Blood Test Results',
      date: '2023-10-10',
      doctor: 'Dr. Michael Chen',
      specialty: 'Pathology',
      description: 'Complete blood count and lipid profile',
      file: 'blood_test_10102023.pdf',
    },
    {
      id: 3,
      type: 'report',
      title: 'X-Ray Report - Chest',
      date: '2023-09-28',
      doctor: 'Dr. Emily Wilson',
      specialty: 'Radiology',
      description: 'Chest X-ray for persistent cough evaluation',
      file: 'xray_chest_09282023.pdf',
    },
    {
      id: 4,
      type: 'prescription',
      title: 'Prescription - Dr. Robert Taylor',
      date: '2023-09-15',
      doctor: 'Dr. Robert Taylor',
      specialty: 'General Physician',
      description: 'Antibiotics for sinus infection',
      file: 'prescription_09152023.pdf',
    },
    {
      id: 5,
      type: 'lab',
      title: 'Urine Test Results',
      date: '2023-09-10',
      doctor: 'Dr. Lisa Wong',
      specialty: 'Nephrology',
      description: 'Routine urine analysis',
      file: 'urine_test_09102023.pdf',
    },
  ];

  useEffect(() => {
    // Simulate API call to fetch medical records
    const timer = setTimeout(() => {
      setMedicalRecords(mockRecords);
      setFilteredResults(mockRecords);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filter records based on search query and selected types
    let results = [...medicalRecords];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        record =>
          record.title.toLowerCase().includes(query) ||
          record.doctor.toLowerCase().includes(query) ||
          record.description.toLowerCase().includes(query) ||
          record.specialty.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (!selectedTypes.includes('all') && selectedTypes.length > 0) {
      results = results.filter(record => selectedTypes.includes(record.type));
    }
    
    setFilteredResults(results);
  }, [searchQuery, selectedTypes, medicalRecords]);

  const getTypeBadge = (type) => {
    const typeMap = {
      prescription: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-800 dark:text-blue-200',
        label: 'Prescription'
      },
      lab: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-800 dark:text-green-200',
        label: 'Lab Test'
      },
      report: {
        bg: 'bg-purple-100 dark:bg-purple-900',
        text: 'text-purple-800 dark:text-purple-200',
        label: 'Medical Report'
      },
    };
    
    const typeInfo = typeMap[type] || { bg: 'bg-gray-100', text: 'text-gray-800', label: type };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.text}`}>
        {typeInfo.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDownload = (file) => {
    // In a real app, this would trigger a file download
    console.log(`Downloading ${file}`);
    // Simulate download
    const link = document.createElement('a');
    link.href = `#`;
    link.download = file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleTypeFilter = (type) => {
    if (type === 'all') {
      setSelectedTypes(['all']);
    } else {
      setSelectedTypes(prev => {
        const newTypes = prev.includes('all') ? [] : [...prev];
        if (newTypes.includes(type)) {
          return newTypes.filter(t => t !== type);
        } else {
          return [...newTypes, type];
        }
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Medical History</h1>
        <div className="mt-4 md:mt-0">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => toggleTypeFilter('all')}
          className={`px-3 py-1 text-sm rounded-full flex items-center ${
            selectedTypes.includes('all')
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => toggleTypeFilter('prescription')}
          className={`px-3 py-1 text-sm rounded-full flex items-center ${
            selectedTypes.includes('prescription')
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <FileText className="h-3.5 w-3.5 mr-1" />
          Prescriptions
        </button>
        <button
          onClick={() => toggleTypeFilter('lab')}
          className={`px-3 py-1 text-sm rounded-full flex items-center ${
            selectedTypes.includes('lab')
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Stethoscope className="h-3.5 w-3.5 mr-1" />
          Lab Tests
        </button>
        <button
          onClick={() => toggleTypeFilter('report')}
          className={`px-3 py-1 text-sm rounded-full flex items-center ${
            selectedTypes.includes('report')
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <FileText className="h-3.5 w-3.5 mr-1" />
          Reports
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredResults.map((record) => (
              <li key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {record.title}
                          </h3>
                          <div className="ml-2">
                            {getTypeBadge(record.type)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {record.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center mr-4">
                            <Stethoscope className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span>{record.doctor}</span>
                            <span className="mx-1">•</span>
                            <span>{record.specialty}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span>{formatDate(record.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleDownload(record.file)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Download className="-ml-0.5 mr-2 h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No records found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No medical records match your current filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
