import { useState, useEffect } from 'react';
import { Search, Filter, User, Stethoscope, MapPin, Calendar, UserPlus, X, Mail, Phone, Award, FileText, Check, Loader2, GraduationCap, Clock } from 'lucide-react';
import { getAvailableDoctors } from '../../services/patientService';
import axios from '../../utils/axios';
import { toast } from 'react-hot-toast';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [mySelections, setMySelections] = useState([]);
  const [selectingDoctor, setSelectingDoctor] = useState(null);

  const specialties = ['all', ...new Set(doctors.map(doctor => doctor.specialty).filter(Boolean))];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getAvailableDoctors();
        const data = response?.data || response || [];
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
    fetchMySelections();
  }, []);

  const fetchMySelections = async () => {
    try {
      const response = await axios.get('/patient/student/my-doctors');
      setMySelections(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching selections:', error);
    }
  };

  const handleSelectDoctor = async (doctorId) => {
    setSelectingDoctor(doctorId);
    try {
      await axios.post('/patient/student/select-doctor', { doctorId });
      toast.success('Request sent to doctor!');
      fetchMySelections();
    } catch (error) {
      console.error('Error selecting doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setSelectingDoctor(null);
    }
  };

  const getSelectionStatus = (doctorId) => {
    const selection = mySelections.find(s => s.doctor?._id === doctorId);
    return selection?.status || null;
  };

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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            Doctor Directory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Find and connect with experienced doctors</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{doctors.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Doctors</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{mySelections.filter(s => s.status === 'accepted').length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">My Mentors</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{mySelections.filter(s => s.status === 'pending').length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{specialties.length - 1}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Specialties</p>
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No doctors found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 group"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    {doctor.photoURL ? (
                      <img 
                        src={doctor.photoURL} 
                        alt={doctor.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{doctor.avatar}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      Dr. {doctor.name}
                    </h2>
                    <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                      {doctor.specialty}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {doctor.experience} yrs
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {doctor.location?.split(',')[0] || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openDoctorModal(doctor)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-xl transition-colors"
                  >
                    View Profile
                  </button>
                  {getSelectionStatus(doctor.id) === 'accepted' ? (
                    <button
                      disabled
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Selected
                    </button>
                  ) : getSelectionStatus(doctor.id) === 'pending' ? (
                    <button
                      disabled
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-xl"
                    >
                      Pending...
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectDoctor(doctor.id)}
                      disabled={selectingDoctor === doctor.id}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/25"
                    >
                      {selectingDoctor === doctor.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Select
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Profile Modal */}
      {modalOpen && selectedDoctor && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                {selectedDoctor.photoURL ? (
                  <img 
                    src={selectedDoctor.photoURL} 
                    alt={selectedDoctor.name}
                    className="w-20 h-20 rounded-xl object-cover border-4 border-white/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center border-4 border-white/30">
                    <span className="text-2xl font-bold text-white">{selectedDoctor.avatar}</span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">Dr. {selectedDoctor.name}</h3>
                  <p className="text-teal-100 font-medium">{selectedDoctor.specialty}</p>
                  <p className="text-sm text-teal-200 mt-1">{selectedDoctor.experience} years experience</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Mail className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedDoctor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Phone className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDoctor.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Award className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">License</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDoctor.licenseNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <MapPin className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedDoctor.location}</p>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-teal-500" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">About</p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDoctor.about}</p>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Calendar className="w-5 h-5 text-teal-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedDoctor.joinedDate}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 pt-0">
              {getSelectionStatus(selectedDoctor.id) === 'accepted' ? (
                <span className="px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Already Selected
                </span>
              ) : getSelectionStatus(selectedDoctor.id) === 'pending' ? (
                <span className="px-4 py-2.5 text-sm font-medium text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-xl">
                  Request Pending
                </span>
              ) : (
                <button
                  onClick={() => {
                    handleSelectDoctor(selectedDoctor.id);
                    closeModal();
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl flex items-center gap-1.5 shadow-lg shadow-teal-500/25"
                >
                  <UserPlus className="w-4 h-4" />
                  Select as Mentor
                </button>
              )}
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
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

export default Doctors;
