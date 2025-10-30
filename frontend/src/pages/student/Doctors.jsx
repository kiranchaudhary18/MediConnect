import { useState, useEffect } from 'react';
import { Search, Filter, User, Stethoscope, Star, MapPin, Calendar, MessageSquare, UserPlus } from 'lucide-react';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for doctors
  const mockDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      experience: 12,
      rating: 4.8,
      reviews: 124,
      location: 'New York, NY',
      avatar: 'SJ',
      about: 'Board-certified cardiologist with over 12 years of experience in treating heart conditions. Specializes in interventional cardiology and preventive care.',
      education: 'MD, Harvard Medical School',
      languages: ['English', 'Spanish']
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurologist',
      experience: 8,
      rating: 4.9,
      reviews: 98,
      location: 'San Francisco, CA',
      avatar: 'MC',
      about: 'Neurology specialist with expertise in treating migraines, epilepsy, and movement disorders. Committed to patient-centered care.',
      education: 'MD, Stanford University',
      languages: ['English', 'Mandarin']
    },
    {
      id: 3,
      name: 'Dr. Emily Wilson',
      specialty: 'Pediatrician',
      experience: 15,
      rating: 4.7,
      reviews: 156,
      location: 'Chicago, IL',
      avatar: 'EW',
      about: 'Pediatric specialist with a gentle approach to children\'s healthcare. Focuses on preventive care and family education.',
      education: 'MD, Johns Hopkins University',
      languages: ['English', 'French']
    },
    {
      id: 4,
      name: 'Dr. Robert Taylor',
      specialty: 'Orthopedic Surgeon',
      experience: 20,
      rating: 4.9,
      reviews: 210,
      location: 'Houston, TX',
      avatar: 'RT',
      about: 'Orthopedic surgeon specializing in sports medicine and joint replacement. Uses minimally invasive techniques for faster recovery.',
      education: 'MD, Baylor College of Medicine',
      languages: ['English', 'Spanish']
    },
    {
      id: 5,
      name: 'Dr. Lisa Wong',
      specialty: 'Dermatologist',
      experience: 10,
      rating: 4.8,
      reviews: 178,
      location: 'Seattle, WA',
      avatar: 'LW',
      about: 'Dermatologist with expertise in medical, surgical, and cosmetic dermatology. Special interest in skin cancer prevention.',
      education: 'MD, University of Washington',
      languages: ['English', 'Cantonese']
    },
    {
      id: 6,
      name: 'Dr. James Wilson',
      specialty: 'Cardiologist',
      experience: 18,
      rating: 4.9,
      reviews: 245,
      location: 'Boston, MA',
      avatar: 'JW',
      about: 'Senior cardiologist with extensive experience in complex cardiac procedures and heart failure management.',
      education: 'MD, Yale School of Medicine',
      languages: ['English']
    },
  ];

  // Unique specialties for filter
  const specialties = ['all', ...new Set(mockDoctors.map(doctor => doctor.specialty))];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setDoctors(mockDoctors);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || doctor.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  const openDoctorModal = (doctor) => {
    setSelectedDoctor(doctor);
    document.getElementById('doctorModal').classList.remove('hidden');
  };

  const closeModal = () => {
    document.getElementById('doctorModal').classList.add('hidden');
    setTimeout(() => setSelectedDoctor(null), 300);
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
                    <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                      <span className="text-xl font-medium text-orange-600 dark:text-orange-300">
                        {doctor.avatar}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {doctor.name}
                      </h2>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {doctor.rating}
                        </span>
                        <span className="mx-1 text-gray-400">•</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {doctor.reviews} reviews
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {doctor.specialty}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="flex-shrink-0 h-4 w-4" />
                      <span className="ml-1">{doctor.location}</span>
                      <span className="mx-2">•</span>
                      <Stethoscope className="flex-shrink-0 h-4 w-4" />
                      <span className="ml-1">{doctor.experience} years</span>
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
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <UserPlus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Modal */}
      <div
        id="doctorModal"
        className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target.id === 'doctorModal' && closeModal()}
      >
        {selectedDoctor && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="h-20 w-20 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <span className="text-2xl font-medium text-orange-600 dark:text-orange-300">
                      {selectedDoctor.avatar}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedDoctor.name}
                    </h2>
                    <p className="text-orange-600 dark:text-orange-400 font-medium">
                      {selectedDoctor.specialty}
                    </p>
                    <div className="mt-1 flex items-center">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {selectedDoctor.rating}
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {selectedDoctor.reviews} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">About</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedDoctor.about}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Stethoscope className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Specialty</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedDoctor.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Experience</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedDoctor.experience} years</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedDoctor.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Languages</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedDoctor.languages.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Education</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedDoctor.education}
                </p>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </div>
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
