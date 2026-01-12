import { useState, useEffect } from 'react';
import { Search, Filter, User, Stethoscope, Star, MapPin, Calendar, MessageSquare, UserPlus, X, Mail, Phone, Award, FileText } from 'lucide-react';
import { getAvailableDoctors } from '../../services/patientService';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Unique specialties for filter - derived from real data
  const specialties = ['all', ...new Set(doctors.map(doctor => doctor.specialty).filter(Boolean))];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getAvailableDoctors();
        // Handle both { data: [...] } and direct array response
        const data = response?.data || response || [];
        // Map backend data to expected format
        const mapped = (Array.isArray(data) ? data : []).map(doc => ({
          id: doc._id,
          name: doc.name,
          email: doc.email,
          specialty: doc.specialization || 'General Physician',
          experience: doc.experience || 0,
          rating: 4.5,
          reviews: 0,
          location: doc.address || 'Not specified',
          avatar: doc.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR',
          about: doc.bio || `Experienced ${doc.specialization || 'medical'} professional dedicated to patient care.`,
          licenseNumber: doc.licenseNumber || 'Not provided',
          phone: doc.contact || 'Not provided',
          photoURL: doc.profilePicture || doc.profilePhoto,
          joinedDate: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'
        }));
        setDoctors(mapped);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || doctor.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  const openDoctorModal = (doctor) => {
    setSelectedDoctor(doctor);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDoctor(null);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Directory</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Search doctors..."
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
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty === 'all' ? 'All Specialties' : specialty}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No doctors found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {doctor.photoURL ? (
                      <img 
                        src={doctor.photoURL} 
                        alt={doctor.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        <span className="text-xl font-medium text-orange-600 dark:text-orange-300">
                          {doctor.avatar}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Dr. {doctor.name}
                    </h2>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {doctor.specialty}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Stethoscope className="flex-shrink-0 h-4 w-4" />
                      <span className="ml-1">{doctor.experience} years exp</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => openDoctorModal(doctor)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Profile Modal */}
      {modalOpen && selectedDoctor && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header with close button */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Doctor Profile</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Doctor Photo & Basic Info */}
              <div className="flex items-center gap-4 mb-6">
                {selectedDoctor.photoURL ? (
                  <img 
                    src={selectedDoctor.photoURL} 
                    alt={selectedDoctor.name}
                    className="h-24 w-24 rounded-full object-cover border-4 border-orange-100 dark:border-orange-900"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center border-4 border-orange-200 dark:border-orange-800">
                    <span className="text-3xl font-bold text-orange-600 dark:text-orange-300">
                      {selectedDoctor.avatar}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Dr. {selectedDoctor.name}
                  </h3>
                  <p className="text-orange-600 dark:text-orange-400 font-medium">
                    {selectedDoctor.specialty}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedDoctor.experience} years of experience
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDoctor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDoctor.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Award className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">License Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDoctor.licenseNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDoctor.location}</p>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">About</p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDoctor.about}</p>
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDoctor.joinedDate}</p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
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

export default Doctors;
