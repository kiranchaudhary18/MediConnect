import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Stethoscope,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookAppointment, getAvailableDoctors } from '../../services/patientService';

const BookAppointment = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState(''); // ✅ NEW
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const { user } = useAuth();

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const list = await getAvailableDoctors();
        const mapped = (Array.isArray(list) ? list : []).map(d => ({
          id: d._id,
          name: d.name,
          specialization: d.specialization || 'General',
          experience: d.experience ? `${d.experience} years` : '—',
          rating: 4.7
        }));
        setDoctors(mapped);
      } catch (e) {
        console.error('Failed to load doctors', e);
        setDoctors([]);
      }
    };
    loadDoctors();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedDoctor) {
    alert('Please select a doctor');
    return;
  }

  if (!selectedDate || !selectedTime || !reason) {
    alert('Please fill all fields');
    return;
  }

  try {
    setLoading(true);

    await bookAppointment({
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      date: selectedDate,
      time: selectedTime,
      reason: reason
    });

    // ✅ SUCCESS
    setSuccess(true);

    // ✅ FORM RESET (AUTO REFRESH FEEL)
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setReason('');

    // success message hide after 3 sec
    setTimeout(() => {
      setSuccess(false);
    }, 3000);

  } catch (error) {
    console.error(error);
    alert('Appointment booking failed');
  } finally {
    setLoading(false);
  }
};


  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>

      {/* ================= FORM ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Select Date & Time</h2>

        {selectedDoctor && (
          <div className="mb-4 p-3 rounded flex items-center gap-2 bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-100 dark:border-green-800">
            <CheckCircle size={18} className="text-green-600 dark:text-green-300" />
            <span className="text-sm">
              Selected Doctor: <b>{selectedDoctor.name}</b>
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />

            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">Select Time</option>
              {timeSlots.map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* ✅ REASON INPUT */}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
            placeholder="Reason for appointment"
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            Book Appointment
          </button>

          {success && (
            <div className="text-green-600 mt-2">
              Appointment booked successfully ✅
            </div>
          )}
        </form>
      </div>

      {/* ================= DOCTORS ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Available Doctors</h2>
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="space-y-4">
          {filteredDoctors.map((doctor) => {
            const isSelected = selectedDoctor?.id === doctor.id;

            return (
              <div
                key={doctor.id}
                className={`rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border transition-colors duration-150
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30' 
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}
                `}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{doctor.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {doctor.specialization} • {doctor.experience}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Rating: {doctor.rating}</span>
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setSelectedDate(new Date().toISOString().split('T')[0]);
                      setSelectedTime('10:00 AM');
                    }}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors duration-150 ${
                      isSelected
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Book Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;






// import { useState, useEffect } from 'react';
// import { Calendar, Clock, Search, Stethoscope, Loader2 } from 'lucide-react';

// import { bookAppointment } from '../../services/patientService';

// const BookAppointment = () => {
//   const [selectedDate, setSelectedDate] = useState('');
//   const [selectedTime, setSelectedTime] = useState('');
//   const [doctorName, setDoctorName] = useState('');
//   const [reason, setReason] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const timeSlots = [
//     '09:00 AM', '10:00 AM', '11:00 AM',
//     '02:00 PM', '03:00 PM', '04:00 PM'
//   ];

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);

//       await bookAppointment({
//         doctorName,
//         date: selectedDate,
//         time: selectedTime,
//         reason
//       });

//       setSuccess(true);
//       setSelectedDate('');
//       setSelectedTime('');
//       setDoctorName('');
//       setReason('');
//     } catch (error) {
//       console.error('Booking failed:', error);
//       alert('Failed to book appointment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= UI SAME ================= */

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Book Appointment</h1>

//       <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
//         <input
//           type="text"
//           placeholder="Doctor Name"
//           value={doctorName}
//           onChange={(e) => setDoctorName(e.target.value)}
//           className="w-full border rounded px-3 py-2"
//           required
//         />

//         <textarea
//           placeholder="Reason"
//           value={reason}
//           onChange={(e) => setReason(e.target.value)}
//           className="w-full border rounded px-3 py-2"
//           required
//         />

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border rounded px-3 py-2"
//             required
//           />

//           <select
//             value={selectedTime}
//             onChange={(e) => setSelectedTime(e.target.value)}
//             className="border rounded px-3 py-2"
//             required
//           >
//             <option value="">Select Time</option>
//             {timeSlots.map(t => (
//               <option key={t}>{t}</option>
//             ))}
//           </select>
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center justify-center"
//         >
//           {loading ? <Loader2 className="animate-spin" /> : 'Book Appointment'}
//         </button>

//         {success && (
//           <div className="text-green-600 mt-3">
//             Appointment booked successfully ✅
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default BookAppointment;
