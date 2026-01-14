import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  Clock4,
  AlertCircle,
  Plus,
  Search,
  Filter,
  X,
  CalendarDays,
  Video,
  MapPin
} from 'lucide-react';
import {
  getPatientAppointments,
  cancelAppointment,
  rescheduleAppointment
} from '../../services/patientService';
import { toast } from 'react-hot-toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModal, setCancelModal] = useState({ open: false, id: null });
  const [reschedModal, setReschedModal] = useState({ open: false, id: null, date: '', time: '' });
  const [detailModal, setDetailModal] = useState({ open: false, appointment: null });

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

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
    intervalId = setInterval(fetchAppointments, 12000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const filteredAppointments = appointments
    .filter(appt => selectedFilter === 'all' || appt.status === selectedFilter)
    .filter(appt => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const doctorName = (appt.doctorId?.name || appt.doctorName || '').toLowerCase();
      const reason = (appt.reason || '').toLowerCase();
      return doctorName.includes(query) || reason.includes(query);
    });

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
      setAppointments(prev => prev.map(appt => 
        appt._id === appointmentId ? { ...appt, status: 'cancelled' } : appt
      ));
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to cancel appointment');
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
      setAppointments(prev => prev.map(appt => 
        appt._id === id ? { ...appt, date, time, status: 'pending' } : appt
      ));
      toast.success('Appointment rescheduled successfully');
    } catch (e) {
      console.error('Reschedule failed', e);
      toast.error('Failed to reschedule');
    } finally {
      setReschedModal({ open: false, id: null, date: '', time: '' });
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Pending',
        icon: Clock4,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        dot: 'bg-amber-500'
      },
      confirmed: {
        label: 'Confirmed',
        icon: CheckCircle2,
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        dot: 'bg-emerald-500'
      },
      completed: {
        label: 'Completed',
        icon: CheckCircle2,
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        dot: 'bg-blue-500'
      },
      cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        dot: 'bg-red-500'
      },
      not_available: {
        label: 'Not Available',
        icon: AlertCircle,
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        dot: 'bg-gray-500'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full animate-spin border-t-emerald-600" />
          <Calendar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your medical appointments</p>
        </div>
        <Link
          to="/patient/book-appointment"
          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Book New
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
              <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.upcoming}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <Clock4 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.cancelled}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by doctor or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                  selectedFilter === filter
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Appointments Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {selectedFilter === 'all' 
                ? "You haven't booked any appointments yet."
                : `No ${selectedFilter} appointments found.`}
            </p>
            <Link
              to="/patient/book-appointment"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          filteredAppointments.map((appointment) => {
            const statusConfig = getStatusConfig(appointment.status);
            const StatusIcon = statusConfig.icon;
            const canModify = ['pending', 'confirmed'].includes(appointment.status);

            return (
              <div
                key={appointment._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Doctor Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/25">
                        {(appointment.doctorId?.name || appointment.doctorName || 'D')[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          Dr. {appointment.doctorId?.name || appointment.doctorName || 'Unknown'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center mt-1">
                          <Stethoscope className="w-4 h-4 mr-1" />
                          {appointment.doctorId?.specialization || 'General Physician'}
                        </p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1">
                          <CalendarDays className="w-4 h-4 mr-1" />
                          <span className="text-sm">{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">{appointment.time}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4 mr-1.5" />
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  {appointment.reason && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {canModify && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-3">
                      <button
                        onClick={() => openReschedule(appointment)}
                        className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => setCancelModal({ open: true, id: appointment._id })}
                        className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setDetailModal({ open: true, appointment })}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-auto"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCancelModal({ open: false, id: null })} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
                Cancel Appointment?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelModal({ open: false, id: null })}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Keep It
                </button>
                <button
                  onClick={() => handleCancelAppointment(cancelModal.id)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReschedModal({ open: false, id: null, date: '', time: '' })} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-600">
              <h3 className="text-xl font-semibold text-white">Reschedule Appointment</h3>
              <p className="text-emerald-100 text-sm mt-1">Select a new date and time</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Date</label>
                <input
                  type="date"
                  value={reschedModal.date}
                  onChange={(e) => setReschedModal(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Time</label>
                <select
                  value={reschedModal.time}
                  onChange={(e) => setReschedModal(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Time</option>
                  {timeSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setReschedModal({ open: false, id: null, date: '', time: '' })}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReschedule}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.open && detailModal.appointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailModal({ open: false, appointment: null })} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-600">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Appointment Details</h3>
                <button
                  onClick={() => setDetailModal({ open: false, appointment: null })}
                  className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(detailModal.appointment.doctorId?.name || detailModal.appointment.doctorName || 'D')[0]}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Dr. {detailModal.appointment.doctorId?.name || detailModal.appointment.doctorName}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    {detailModal.appointment.doctorId?.specialization || 'General Physician'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2 text-emerald-500" />
                    {formatDate(detailModal.appointment.date)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                    {detailModal.appointment.time}
                  </p>
                </div>
              </div>

              {detailModal.appointment.reason && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reason for Visit</p>
                  <p className="text-gray-900 dark:text-white">{detailModal.appointment.reason}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${getStatusConfig(detailModal.appointment.status).color}`}>
                  {getStatusConfig(detailModal.appointment.status).label}
                </span>
                <button
                  onClick={() => setDetailModal({ open: false, appointment: null })}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
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

export default Appointments;
