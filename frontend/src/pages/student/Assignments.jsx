import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, Eye, FileText, Search, Filter, Send, X, Loader2 } from 'lucide-react';
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

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', icon: BookOpen },
      'in-progress': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', icon: Clock },
      submitted: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', icon: Send },
      completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', icon: CheckCircle },
      overdue: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: Clock }
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
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
      await axios.patch(`/patient/student/assignments/${selectedAssignment._id}/submit`, {
        response
      });
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
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Assignments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review case studies and complete your learning tasks</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.submitted}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            placeholder="Search assignments..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {filteredAssignments.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {assignments.length === 0 ? 'No assignments yet. Your doctors will assign you case studies soon!' : 'No assignments match your filter'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAssignments.map((assignment, index) => (
              <div 
                key={assignment._id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{index + 1}</span>
                      </span>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                      {getStatusBadge(assignment.status)}
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 ml-11">
                      <span className="font-medium">Type:</span> <span className="capitalize">{assignment.type}</span> • 
                      <span className="font-medium ml-2">By:</span> Dr. {assignment.doctor?.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 ml-11 line-clamp-2">
                      {assignment.description}
                    </p>
                    {assignment.grade && (
                      <p className="mt-2 ml-11 text-sm">
                        <span className="font-medium text-green-600 dark:text-green-400">Grade: {assignment.grade}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex gap-2 justify-end">
                      <button 
                        onClick={() => openAssignmentModal(assignment)}
                        className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      {(assignment.status === 'pending' || assignment.status === 'in-progress') && (
                        <button 
                          onClick={() => openSubmitModal(assignment)}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Detail Modal */}
      {modalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAssignment.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Assigned by Dr. {selectedAssignment.doctor?.name}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status and Due Date */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedAssignment.status)}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                </p>
              </div>

              {/* Type */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Assignment Type</h3>
                <p className="text-gray-900 dark:text-white capitalize">{selectedAssignment.type}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{selectedAssignment.description}</p>
              </div>

              {/* Medical Record Info */}
              {selectedAssignment.medicalRecord && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2">Related Case</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Diagnosis:</strong> {selectedAssignment.medicalRecord.diagnosis}
                  </p>
                  {selectedAssignment.medicalRecord.treatment && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <strong>Treatment:</strong> {selectedAssignment.medicalRecord.treatment}
                    </p>
                  )}
                </div>
              )}

              {/* Student Response */}
              {selectedAssignment.studentResponse && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Your Response</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedAssignment.studentResponse}</p>
                </div>
              )}

              {/* Feedback */}
              {selectedAssignment.feedback && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                    Feedback (Grade: {selectedAssignment.grade})
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedAssignment.feedback}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Close
              </button>
              {(selectedAssignment.status === 'pending' || selectedAssignment.status === 'in-progress') && (
                <button
                  onClick={() => {
                    closeModal();
                    openSubmitModal(selectedAssignment);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submit Assignment</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedAssignment.title}</p>
                </div>
                <button
                  onClick={() => setSubmitModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
                <p className="text-gray-600 dark:text-gray-300">{selectedAssignment.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Response *
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  rows={8}
                  placeholder="Write your analysis, findings, and conclusions here..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setSubmitModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !response.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
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
