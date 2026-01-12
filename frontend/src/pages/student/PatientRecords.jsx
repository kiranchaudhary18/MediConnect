import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Download, User, Calendar, Info, X } from 'lucide-react';
import { getStudentMedicalRecords } from '../../services/patientService';

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Get unique diseases and doctors for filters - derived from real data
  const diseases = ['all', ...new Set(records.map(record => record.disease).filter(Boolean))];
  const doctors = ['all', ...new Set(records.map(record => record.doctor).filter(Boolean))];

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await getStudentMedicalRecords();
        // Handle both { data: [...] } and direct array response
        const data = response?.data || response || [];
        // Map data to expected format
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Records</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
            >
              {diseases.map((disease) => (
                <option key={disease} value={disease}>
                  {disease === 'all' ? 'All Diseases' : disease}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
            >
              {doctors.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor === 'all' ? 'All Doctors' : doctor}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Patient ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Age/Gender
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Disease
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Treatment Summary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Doctor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No records found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {record.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {record.age} / {record.gender.charAt(0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        {record.disease}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {record.treatment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {record.doctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openRecordModal(record)}
                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        <Info className="h-5 w-5" />
                        <span className="sr-only">View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Details Modal */}
      {modalOpen && selectedRecord && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Patient Record: {selectedRecord.id}
                  </h2>
                  <div className="mt-1 flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Patient Information</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Patient ID</div>
                      <div className="text-sm text-gray-900 dark:text-white">{selectedRecord.id}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Age / Gender</div>
                      <div className="text-sm text-gray-900 dark:text-white">{selectedRecord.age} years, {selectedRecord.gender}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Diagnosis</div>
                      <div className="text-sm text-gray-900 dark:text-white">{selectedRecord.disease}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Doctor</div>
                      <div className="text-sm text-gray-900 dark:text-white">{selectedRecord.doctor}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">Date</div>
                      <div className="text-sm text-gray-900 dark:text-white">{selectedRecord.date}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">AI-Generated Summary</h3>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedRecord.notes}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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

export default PatientRecords;
