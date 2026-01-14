import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, Eye, FileText, Search, Filter, Send, X, Loader2, Award, CalendarDays, ArrowRight } from 'lucide-react';
import axios from '../../utils/axios';
import { toast } from 'react-hot-toast';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/patient/student/assignments');
      setAssignments(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: BookOpen, label: 'Pending' },
      'in-progress': { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', icon: Clock, label: 'In Progress' },
      submitted: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', icon: Send, label: 'Submitted' },
      completed: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle, label: 'Completed' },
      overdue: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', icon: Clock, label: 'Overdue' }
    };
    return configs[status] || configs.pending;
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const openAssignmentModal = (assignment) => {
    setSelectedAssignment(assignment);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAssignment(null);
  };

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setResponse(assignment.studentResponse || '');
    setSubmitModal(true);
  };

  const handleSubmit = async () => {
    if (!response.trim()) {
      toast.error('Please enter your response');
      return;
    }

    setSubmitting(true);
    try {
      await axios.patch(`/patient/student/assignments/${selectedAssignment._id}/submit`, { response });
      toast.success('Assignment submitted successfully!');
      setSubmitModal(false);
      fetchAssignments();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: assignments.length,
    completed: assignments.filter(a => a.status === 'completed').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    pending: assignments.filter(a => a.status === 'pending' || a.status === 'in-progress').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          My Assignments
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review case studies and complete your learning tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
              <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.submitted}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 appearance-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-teal-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {assignments.length === 0 ? 'No assignments yet' : 'No matching assignments'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {assignments.length === 0 ? 'Your doctors will assign you case studies soon!' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAssignments.map((assignment, index) => (
            <div
              key={assignment._id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{assignment.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dr. {assignment.doctor?.name}</p>
                    </div>
                  </div>
                  {getStatusBadge(assignment.status)}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {assignment.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                    {assignment.grade && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Award className="w-3.5 h-3.5" />
                        Grade: {assignment.grade}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openAssignmentModal(assignment)}
                      className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {(assignment.status === 'pending' || assignment.status === 'in-progress') && (
                      <button
                        onClick={() => openSubmitModal(assignment)}
                        className="p-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Detail Modal */}
      {modalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedAssignment.title}</h2>
                  <p className="text-teal-100">By Dr. {selectedAssignment.doctor?.name}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedAssignment.status)}
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Type</h3>
                <p className="text-gray-900 dark:text-white capitalize">{selectedAssignment.type}</p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedAssignment.description}</p>
              </div>

              {selectedAssignment.medicalRecord && (
                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-900/30">
                  <h3 className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">Related Case</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Diagnosis:</strong> {selectedAssignment.medicalRecord.diagnosis}
                  </p>
                  {selectedAssignment.medicalRecord.treatment && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      <strong>Treatment:</strong> {selectedAssignment.medicalRecord.treatment}
                    </p>
                  )}
                </div>
              )}

              {selectedAssignment.studentResponse && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Your Response</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedAssignment.studentResponse}</p>
                </div>
              )}

              {selectedAssignment.feedback && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <h3 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Feedback (Grade: {selectedAssignment.grade})
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedAssignment.feedback}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Close
              </button>
              {(selectedAssignment.status === 'pending' || selectedAssignment.status === 'in-progress') && (
                <button
                  onClick={() => { closeModal(); openSubmitModal(selectedAssignment); }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl flex items-center gap-2 shadow-lg shadow-teal-500/25"
                >
                  <Send className="w-4 h-4" />
                  Submit Response
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {submitModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submit Assignment</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedAssignment.title}</p>
                </div>
                <button
                  onClick={() => setSubmitModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-300">
                {selectedAssignment.description}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Response *
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  rows={8}
                  placeholder="Write your analysis, findings, and conclusions here..."
                />
              </div>
            </div>

            <div className="p-6 pt-0 flex justify-end gap-3">
              <button
                onClick={() => setSubmitModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !response.trim()}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-500/25"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
