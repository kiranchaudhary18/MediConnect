import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, AlertCircle, CheckCircle2, XCircle, Clock4 } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data for appointments
  const mockAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      date: '2023-11-15',
      time: '10:00 AM',
      status: 'upcoming',
      reason: 'Routine checkup',
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'Neurologist',
      date: '2023-11-10',
      time: '02:30 PM',
      status: 'completed',
      reason: 'Headache consultation',
    },
    {
      id: 3,
      doctor: 'Dr. Emily Wilson',
      specialty: 'Pediatrician',
      date: '2023-11-05',
      time: '11:15 AM',
      status: 'cancelled',
      reason: 'Child vaccination',
    },
  ];

  useEffect(() => {
    // Simulate API call to fetch appointments
    const timer = setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredAppointments = selectedFilter === 'all' 
    ? appointments 
    : appointments.filter(appt => appt.status === selectedFilter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Clock4 className="mr-1 h-3 w-3" />
            Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
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
      default:
        return null;
    }
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      // In a real app, this would be an API call
      setAppointments(prev => 
        prev.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: 'cancelled' } 
            : appt
        )
      );
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
        <div className="mt-4 md:mt-0 flex space-x-2">
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
            onClick={() => setSelectedFilter('upcoming')}
            className={`px-3 py-1 text-sm rounded-full flex items-center ${
              selectedFilter === 'upcoming'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Clock4 className="h-3.5 w-3.5 mr-1" />
            Upcoming
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
              key={appointment.id}
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
                          {appointment.doctor}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {appointment.specialty}
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
                      {appointment.status === 'upcoming' && (
                        <>
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-700 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-200 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Cancel
                          </button>
                          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
    </div>
  );
};

export default Appointments;
