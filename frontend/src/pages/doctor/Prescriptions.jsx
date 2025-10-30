import { useState, useEffect } from 'react';
import { Search, FileText, Plus, X, User, Calendar, Pill, AlertCircle } from 'lucide-react';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    diagnosis: '',
    medicines: [{ name: '', dosage: '', duration: '', instructions: '' }],
    notes: '',
    validUntil: ''
  });

  useEffect(() => {
    // Simulate API call
    const fetchPrescriptions = async () => {
      try {
        // In a real app: const response = await axios.get('/api/doctor/prescriptions');
        setTimeout(() => {
          const mockPrescriptions = [
            {
              id: 1,
              patientName: 'John Doe',
              date: '2023-10-25',
              diagnosis: 'Hypertension',
              medicines: [
                { name: 'Lisinopril', dosage: '10mg', duration: '30 days', instructions: 'Once daily' },
                { name: 'Amlodipine', dosage: '5mg', duration: '30 days', instructions: 'Once daily at bedtime' }
              ],
              notes: 'Follow up in 4 weeks',
              validUntil: '2023-11-24'
            },
            // Add more mock data as needed
          ];
          setPrescriptions(mockPrescriptions);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setLoading(false);
      }
    };
    
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter(prescription => 
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicineChange = (index, e) => {
    const { name, value } = e.target;
    const medicines = [...formData.medicines];
    medicines[index] = {
      ...medicines[index],
      [name]: value
    };
    setFormData(prev => ({
      ...prev,
      medicines
    }));
  };

  const addMedicineField = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', duration: '', instructions: '' }]
    }));
  };

  const removeMedicineField = (index) => {
    const medicines = [...formData.medicines];
    medicines.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      medicines
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app: await axios.post('/api/doctor/prescriptions', formData);
    alert('Prescription saved successfully!');
    setShowForm(false);
    // Reset form
    setFormData({
      patientId: '',
      patientName: '',
      diagnosis: '',
      medicines: [{ name: '', dosage: '', duration: '', instructions: '' }],
      notes: '',
      validUntil: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prescriptions</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and create patient prescriptions
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">New Prescription</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Patient Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="patientName"
                    id="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Search patient..."
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Diagnosis
                </label>
                <input
                  type="text"
                  name="diagnosis"
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="Enter diagnosis"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Medicines
                  </label>
                  <button
                    type="button"
                    onClick={addMedicineField}
                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    + Add Medicine
                  </button>
                </div>
                
                <div className="mt-2 space-y-4">
                  {formData.medicines.map((medicine, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Medicine Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={medicine.name}
                          onChange={(e) => handleMedicineChange(index, e)}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholder="e.g. Paracetamol"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          name="dosage"
                          value={medicine.dosage}
                          onChange={(e) => handleMedicineChange(index, e)}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholder="e.g. 500mg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={medicine.duration}
                          onChange={(e) => handleMedicineChange(index, e)}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                          placeholder="e.g. 7 days"
                          required
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Instructions
                          </label>
                          <input
                            type="text"
                            name="instructions"
                            value={medicine.instructions}
                            onChange={(e) => handleMedicineChange(index, e)}
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            placeholder="e.g. After meals"
                          />
                        </div>
                        {formData.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicineField(index)}
                            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valid Until
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="validUntil"
                    id="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  placeholder="Any additional instructions or notes..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-white py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Prescription
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Medicines
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions.map((prescription) => (
                    <tr key={prescription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                              {prescription.patientName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {prescription.patientName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {prescription.diagnosis}
                        </div>
                        {prescription.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {prescription.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {prescription.medicines.slice(0, 2).map((medicine, idx) => (
                            <div key={idx} className="text-sm text-gray-900 dark:text-white">
                              <span className="font-medium">{medicine.name}</span> - {medicine.dosage}
                            </div>
                          ))}
                          {prescription.medicines.length > 2 && (
                            <div className="text-xs text-indigo-600 dark:text-indigo-400">
                              +{prescription.medicines.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {prescription.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className={`text-sm ${
                            new Date(prescription.validUntil) < new Date() 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {prescription.validUntil}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                          View
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                          Print
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center justify-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mb-2" />
                        <p>No prescriptions found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {searchTerm ? 'Try a different search term' : 'Create your first prescription'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredPrescriptions.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">20</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <span className="sr-only">Previous</span>
                    {/* Heroicon name: solid/chevron-left */}
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    aria-current="page"
                    className="z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 text-indigo-600 dark:text-indigo-300 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    1
                  </button>
                  <button className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                    2
                  </button>
                  <button className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                    3
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <span className="sr-only">Next</span>
                    {/* Heroicon name: solid/chevron-right */}
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
