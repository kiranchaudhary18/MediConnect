import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, AlertCircle, CheckCircle2, XCircle, Clock4 } from 'lucide-react';
import {
  getPatientAppointments,
  cancelAppointment,
  rescheduleAppointment
} from '../../services/patientService';


const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState({ open: false, id: null });
  const [reschedModal, setReschedModal] = useState({ open: false, id: null, date: '', time: '' });

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  // // Mock data for appointments
  // const mockAppointments = [
  //   {
  //     id: 1,
  //     doctor: 'Dr. Sarah Johnson',
  //     specialty: 'Cardiologist',
  //     date: '2023-11-15',
  //     time: '10:00 AM',
  //     status: 'upcoming',
  //     reason: 'Routine checkup',
  //   },
  //   {
  //     id: 2,
  //     doctor: 'Dr. Michael Chen',
  //     specialty: 'Neurologist',
  //     date: '2023-11-10',
  //     time: '02:30 PM',
  //     status: 'completed',
  //     reason: 'Headache consultation',
  //   },
  //   {
  //     id: 3,
  //     doctor: 'Dr. Emily Wilson',
  //     specialty: 'Pediatrician',
  //     date: '2023-11-05',
  //     time: '11:15 AM',
  //     status: 'cancelled',
  //     reason: 'Child vaccination',
  //   },
  // ];

 useEffect(() => {
  let isMounted = true;
  let intervalId;

  const fetchAppointments = async () => {
    try {
      const data = await getPatientAppointments();
      if (isMounted) setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load appointments', error);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchAppointments();
  // Poll every 12 seconds to reflect doctor status updates
  intervalId = setInterval(fetchAppointments, 12000);

  return () => {
    isMounted = false;
    clearInterval(intervalId);
  };
}, []);


  const filteredAppointments = selectedFilter === 'all' 
    ? appointments 
    : appointments.filter(appt => appt.status === selectedFilter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock4 className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </span>
        );
      case 'not_available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Not available
          </span>
        );
      default:
        return null;
    }
  };

 const handleCancelAppointment = async (appointmentId) => {
  try {
    await cancelAppointment(appointmentId);
    setAppointments(prev => prev.map(appt => appt._id === appointmentId ? { ...appt, status: 'cancelled' } : appt));
  } catch (error) {
    console.error(error);
  } finally {
    setCancelModal({ open: false, id: null });
  }
};

 const openReschedule = (appt) => {
  const isoDate = appt.date ? new Date(appt.date).toISOString().split('T')[0] : '';
  setReschedModal({ open: true, id: appt._id, date: isoDate, time: appt.time || '' });
 };

 const submitReschedule = async () => {
  const { id, date, time } = reschedModal;
  if (!id || !date || !time) return;
  try {
    await rescheduleAppointment(id, { date, time });
    setAppointments(prev => prev.map(appt => appt._id === id ? { ...appt, date, time, status: 'pending' } : appt));
  } catch (e) {
    console.error('Reschedule failed', e);
  } finally {
    setReschedModal({ open: false, id: null, date: '', time: '' });
  }
 };


  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Appointments</h1>
        <div className="mt-4 md:mt-0 flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 text-sm rounded-full ${
              selectedFilter === 'all'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilter('pending')}
            className={`px-3 py-1 text-sm rounded-full flex items-center ${
              selectedFilter === 'pending'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Clock4 className="h-3.5 w-3.5 mr-1" />
            Pending
          </button>
          <button
            onClick={() => setSelectedFilter('confirmed')}
            className={`px-3 py-1 text-sm rounded-full flex items-center ${
              selectedFilter === 'confirmed'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setSelectedFilter('completed')}
            className={`px-3 py-1 text-sm rounded-full flex items-center ${
              selectedFilter === 'completed'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Completed
          </button>
          <button
            onClick={() => setSelectedFilter('cancelled')}
            className={`px-3 py-1 text-sm rounded-full flex items-center ${
              selectedFilter === 'cancelled'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Cancelled
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border-l-4 border-blue-500 dark:border-blue-600"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
  {appointment.doctorName || 'Doctor'}
</h3>

                       <p className="text-sm text-gray-500 dark:text-gray-400">
  {appointment.specialty || 'General Consultation'}
</p>

                      </div>
                    </div>
                    <div className="mt-4 sm:mt-2 sm:ml-16 space-y-1">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="flex-shrink-0 mr-2 h-4 w-4" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="flex-shrink-0 mr-2 h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <User className="flex-shrink-0 mr-2 h-4 w-4" />
                        <span>Reason: {appointment.reason}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col sm:items-end">
                    <div className="mb-3">
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="flex space-x-2">
                      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                        <>
                          <button
                            key={`cancel-${appointment._id}`}
                            onClick={() => setCancelModal({ open: true, id: appointment._id })}

                            className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-700 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-200 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Cancel
                          </button>
                          <button
                            key={`resched-${appointment._id}`}
                            onClick={() => openReschedule(appointment)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Reschedule
                          </button>
                        </>
                      )}
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No appointments found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {selectedFilter === 'all'
              ? 'You don\'t have any appointments yet.'
              : `You don't have any ${selectedFilter} appointments.`}
          </p>
          <div className="mt-6">
            <a
              href="/patient/book-appointment"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Book an Appointment
            </a>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cancel appointment?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to cancel this appointment?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCancelModal({ open: false, id: null })}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                No
              </button>
              <button
                onClick={() => handleCancelAppointment(cancelModal.id)}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reschedule appointment</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={reschedModal.date}
                  onChange={(e) => setReschedModal(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Time</label>
                <select
                  value={reschedModal.time}
                  onChange={(e) => setReschedModal(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Time</option>
                  {timeSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setReschedModal({ open: false, id: null, date: '', time: '' })}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={submitReschedule}
                disabled={!reschedModal.date || !reschedModal.time}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;

/* ================= MODALS ================= */
// We append modals at the end of file to keep JSX above cleaner

















// import { useState, useEffect } from 'react';
// import {
//   Calendar, Clock, User, Stethoscope,
//   AlertCircle, CheckCircle2, XCircle, Clock4
// } from 'lucide-react';

// import {
//   getPatientAppointments,
//   cancelAppointment
// } from '../../services/patientService';

// const Appointments = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedFilter, setSelectedFilter] = useState('all');

//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         const data = await getPatientAppointments();
//         setAppointments(data || []);
//       } catch (error) {
//         console.error('Error loading appointments:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAppointments();
//   }, []);

//   const filteredAppointments =
//     selectedFilter === 'all'
//       ? appointments
//       : appointments.filter(a => a.status === selectedFilter);

//   const handleCancelAppointment = async (appointmentId) => {
//     if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

//     try {
//       await cancelAppointment(appointmentId);
//       setAppointments(prev =>
//         prev.map(a =>
//           a._id === appointmentId
//             ? { ...a, status: 'cancelled' }
//             : a
//         )
//       );
//     } catch (error) {
//       console.error('Cancel failed:', error);
//     }
//   };

//   const getStatusBadge = (status) => {
//     if (status === 'upcoming')
//       return (
//         <span className="badge bg-blue-100 text-blue-800">
//           <Clock4 className="h-3 w-3 mr-1" /> Upcoming
//         </span>
//       );

//     if (status === 'completed')
//       return (
//         <span className="badge bg-green-100 text-green-800">
//           <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
//         </span>
//       );

//     if (status === 'cancelled')
//       return (
//         <span className="badge bg-red-100 text-red-800">
//           <XCircle className="h-3 w-3 mr-1" /> Cancelled
//         </span>
//       );
//   };

//   const formatDate = (date) =>
//     new Date(date).toLocaleDateString('en-IN', {
//       weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
//     });

//   /* ================= UI SAME ================= */

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">My Appointments</h1>

//       {loading ? (
//         <div className="flex justify-center py-20">
//           <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
//         </div>
//       ) : filteredAppointments.length > 0 ? (
//         <div className="space-y-4">
//           {filteredAppointments.map((appointment) => (
//             <div
//               key={appointment._id}
//               className="bg-white rounded-lg shadow border-l-4 border-blue-500 p-4"
//             >
//               <div className="flex justify-between">
//                 <div>
//                   <div className="flex items-center space-x-3">
//                     <Stethoscope className="text-blue-500" />
//                     <h3 className="font-semibold">{appointment.doctorName}</h3>
//                   </div>

//                   <div className="mt-2 text-sm text-gray-600 space-y-1">
//                     <div className="flex items-center">
//                       <Calendar className="h-4 w-4 mr-2" />
//                       {formatDate(appointment.date)}
//                     </div>
//                     <div className="flex items-center">
//                       <Clock className="h-4 w-4 mr-2" />
//                       {appointment.time}
//                     </div>
//                     <div className="flex items-center">
//                       <User className="h-4 w-4 mr-2" />
//                       {appointment.reason}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="text-right">
//                   {getStatusBadge(appointment.status)}

//                   {appointment.status === 'upcoming' && (
//                     <button
//                       onClick={() => handleCancelAppointment(appointment._id)}
//                       className="block mt-3 text-sm text-red-600 hover:underline"
//                     >
//                       Cancel
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-20 bg-white rounded-lg shadow">
//           <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
//           <p className="mt-2 text-gray-500">No appointments found</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Appointments;
