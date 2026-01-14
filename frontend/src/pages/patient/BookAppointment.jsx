import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Search,
  Stethoscope,
  Loader2,
  CheckCircle,
  User,
  Star,
  MapPin,
  ArrowRight,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookAppointment, getAvailableDoctors } from '../../services/patientService';
import { toast } from 'react-hot-toast';

const BookAppointment = () => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const timeSlots = [
    { time: '09:00 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '12:00 PM', available: false },
    { time: '02:00 PM', available: true },
    { time: '03:00 PM', available: true },
    { time: '04:00 PM', available: true },
    { time: '05:00 PM', available: true }
  ];

  const specializations = ['All', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'Orthopedic', 'General'];
  const [selectedSpec, setSelectedSpec] = useState('All');

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const list = await getAvailableDoctors();
        const mapped = (Array.isArray(list) ? list : []).map(d => ({
          id: d._id,
          name: d.name,
          specialization: d.specialization || 'General',
          experience: d.experience ? `${d.experience} years` : '5+ years',
          rating: d.rating || 4.5,
          image: d.profilePicture || null,
          location: d.location || 'MediConnect Hospital'
        }));
        setDoctors(mapped);
      } catch (e) {
        console.error('Failed to load doctors', e);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = selectedSpec === 'All' || d.specialization.toLowerCase() === selectedSpec.toLowerCase();
    return matchesSearch && matchesSpec;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    if (!selectedDate || !selectedTime || !reason) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setSubmitting(true);

      await bookAppointment({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: selectedDate,
        time: selectedTime,
        reason: reason
      });

      setSuccess(true);
      toast.success('Appointment booked successfully!');

      // Reset after delay
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 2000);

    } catch (error) {
      console.error(error);
      toast.error('Appointment booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full animate-spin border-t-emerald-600" />
          <Stethoscope className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 animate-pulse" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Appointment Booked!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Your appointment with Dr. {selectedDoctor?.name} has been confirmed.
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">
            Redirecting to your appointments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book an Appointment</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Find the right doctor and schedule your visit</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= 1 ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              1
            </div>
            <span className={`text-sm mt-2 ${step >= 1 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500'}`}>
              Select Doctor
            </span>
          </div>
          <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              2
            </div>
            <span className={`text-sm mt-2 ${step >= 2 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500'}`}>
              Choose Time
            </span>
          </div>
          <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= 3 ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              3
            </div>
            <span className={`text-sm mt-2 ${step >= 3 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500'}`}>
              Confirm
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {specializations.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpec(spec)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                      selectedSpec === spec
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Doctors Found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                    selectedDoctor?.id === doctor.id
                      ? 'border-emerald-500 shadow-emerald-500/20'
                      : 'border-gray-100 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                  onClick={() => selectDoctor(doctor)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/25 overflow-hidden flex-shrink-0">
                        {doctor.image ? (
                          <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                        ) : (
                          doctor.name[0]
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">Dr. {doctor.name}</h3>
                        <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">{doctor.specialization}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <Star className="w-4 h-4 text-amber-400 fill-current mr-1" />
                          <span>{doctor.rating}</span>
                          <span className="mx-2">•</span>
                          <span>{doctor.experience}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate">{doctor.location}</span>
                    </div>
                    <button
                      className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center"
                    >
                      Select Doctor
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Step 2: Choose Date & Time */}
      {step === 2 && selectedDoctor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selected Doctor Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-600">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                  {selectedDoctor.image ? (
                    <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedDoctor.name[0]
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Dr. {selectedDoctor.name}</h3>
                  <p className="text-emerald-100">{selectedDoctor.specialization}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Experience</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoctor.experience}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Rating</span>
                <span className="font-medium text-gray-900 dark:text-white flex items-center">
                  <Star className="w-4 h-4 text-amber-400 fill-current mr-1" />
                  {selectedDoctor.rating}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Location</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedDoctor.location}</span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="w-full py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
              >
                Change Doctor
              </button>
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Date & Time</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Choose your preferred appointment slot</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Available Time Slots
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                        selectedTime === slot.time
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25'
                          : slot.available
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => selectedDate && selectedTime && setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirm & Book */}
      {step === 3 && selectedDoctor && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-600">
              <h3 className="text-lg font-semibold text-white">Confirm Your Appointment</h3>
              <p className="text-emerald-100 text-sm mt-1">Review and confirm your booking details</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {selectedDoctor.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Dr. {selectedDoctor.name}</h4>
                    <p className="text-emerald-600 dark:text-emerald-400">{selectedDoctor.specialization}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'short', month: 'short', day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                      {selectedTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Visit *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  placeholder="Describe your symptoms or reason for appointment..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !reason}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
