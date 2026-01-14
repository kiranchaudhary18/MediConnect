import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock, 
  Eye, 
  Trash2, 
  X, 
  Calendar, 
  BookOpen,
  Send,
  User,
  Loader2,
  UserCheck,
  UserX,
  Award,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Star
} from 'lucide-react';
import axios from '../../utils/axios';
import { toast } from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [processingStudent, setProcessingStudent] = useState(null);
  
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewAssignmentModal, setViewAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradeModal, setGradeModal] = useState(false);
  
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    type: 'case-study',
    dueDate: ''
  });
  const [gradeForm, setGradeForm] = useState({ feedback: '', grade: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchAssignments();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/patient/doctor/students');
      setStudents(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/patient/doctor/assignments');
      setAssignments(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (student) => {
    setSelectedStudent(student);
    setAssignmentForm({
      title: '',
      description: '',
      type: 'case-study',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setAssignModalOpen(true);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentForm.title || !assignmentForm.description || !assignmentForm.dueDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/patient/doctor/assignments', {
        studentId: selectedStudent._id,
        ...assignmentForm
      });
      toast.success('Assignment created successfully');
      setAssignModalOpen(false);
      fetchStudents();
      fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudentSelection = async (selectionId, status) => {
    setProcessingStudent(selectionId);
    try {
      await axios.patch(`/patient/doctor/student-selection/${selectionId}`, { status });
      toast.success(status === 'accepted' ? 'Student accepted!' : 'Student rejected');
      fetchStudents();
    } catch (error) {
      console.error('Error updating selection:', error);
      toast.error('Failed to update');
    } finally {
      setProcessingStudent(null);
    }
  };

  const openViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setViewAssignmentModal(true);
  };

  const openGradeModal = (assignment) => {
    setSelectedAssignment(assignment);
    setGradeForm({ feedback: assignment.feedback || '', grade: assignment.grade || '' });
    setGradeModal(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.patch(`/patient/doctor/assignments/${selectedAssignment._id}/grade`, gradeForm);
      toast.success('Assignment graded successfully');
      setGradeModal(false);
      fetchAssignments();
    } catch (error) {
      console.error('Error grading assignment:', error);
      toast.error('Failed to grade assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await axios.delete(`/patient/doctor/assignments/${id}`);
      toast.success('Assignment deleted');
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to delete assignment');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssignments = assignments.filter(a =>
    a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.student?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return styles[status] || styles.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-200 dark:border-violet-900 rounded-full animate-spin border-t-violet-600"></div>
          <GraduationCap className="w-6 h-6 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your students and assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-violet-100 dark:border-violet-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{students.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{students.filter(s => s.selectionStatus === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Assignments</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{assignments.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{assignments.filter(a => a.status === 'completed').length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'students'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Students
          </div>
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'assignments'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Assignments
          </div>
        </button>
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No students yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Students can select you from the Doctor Directory</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student._id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    {student.profilePicture ? (
                      <img src={student.profilePicture} alt={student.name} className="w-14 h-14 rounded-2xl object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-white">{student.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{student.name}</h3>
                      {student.selectionStatus === 'pending' && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full uppercase tracking-wide">
                          Pending
                        </span>
                      )}
                      {student.selectionStatus === 'accepted' && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full uppercase tracking-wide">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{student.email}</p>
                  </div>
                </div>

                {student.selectionMessage && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{student.selectionMessage}"</p>
                  </div>
                )}

                {student.selectionStatus === 'accepted' && (
                  <>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{student.totalAssignments || 0}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{student.completedAssignments || 0}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Done</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{student.pendingAssignments || 0}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Pending</p>
                      </div>
                    </div>

                    <button
                      onClick={() => openAssignModal(student)}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-medium text-sm shadow-lg shadow-violet-500/25"
                    >
                      <Plus className="w-4 h-4" />
                      Create Assignment
                    </button>
                  </>
                )}

                {student.selectionStatus === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleStudentSelection(student.selectionId, 'accepted')}
                      disabled={processingStudent === student.selectionId}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all font-medium text-sm disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                    >
                      {processingStudent === student.selectionId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Accept
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleStudentSelection(student.selectionId, 'rejected')}
                      disabled={processingStudent === student.selectionId}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-xl transition-all font-medium text-sm disabled:opacity-50"
                    >
                      <UserX className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No assignments found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{assignment.title}</p>
                            <p className="text-xs text-gray-500 capitalize">{assignment.type?.replace('-', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">{assignment.student?.name || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(assignment.status)}`}>
                          {assignment.status?.charAt(0).toUpperCase() + assignment.status?.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {assignment.grade ? (
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">{assignment.grade}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openViewAssignment(assignment)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {assignment.status === 'submitted' && (
                            <button
                              onClick={() => openGradeModal(assignment)}
                              className="p-2 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 dark:text-violet-400 transition-colors"
                            >
                              <Award className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAssignment(assignment._id)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAssignModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Assignment</h3>
                  <p className="text-sm text-gray-500">For {selectedStudent?.name}</p>
                </div>
              </div>
              <button onClick={() => setAssignModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Assignment title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <select
                  value={assignmentForm.type}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="case-study">Case Study</option>
                  <option value="research">Research</option>
                  <option value="presentation">Presentation</option>
                  <option value="quiz">Quiz</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  placeholder="Describe the assignment..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Creating...' : 'Create Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Assignment Modal */}
      {viewAssignmentModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewAssignmentModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedAssignment.title}</h3>
              <button onClick={() => setViewAssignmentModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700 dark:text-gray-300">{selectedAssignment.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Student</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedAssignment.student?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Due Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedAssignment.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedAssignment.studentResponse && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Student Response</p>
                  <p className="text-gray-700 dark:text-gray-300">{selectedAssignment.studentResponse}</p>
                </div>
              )}
              {selectedAssignment.feedback && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">Your Feedback</p>
                  <p className="text-gray-700 dark:text-gray-300">{selectedAssignment.feedback}</p>
                  {selectedAssignment.grade && (
                    <p className="mt-2 font-semibold text-emerald-700 dark:text-emerald-400">Grade: {selectedAssignment.grade}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {gradeModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setGradeModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 z-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grade Assignment</h3>
                  <p className="text-sm text-gray-500">{selectedAssignment.title}</p>
                </div>
              </div>
              <button onClick={() => setGradeModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {selectedAssignment.studentResponse && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student Response</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedAssignment.studentResponse}</p>
              </div>
            )}

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade</label>
                <input
                  type="text"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="A+, B, 95%, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback</label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Provide feedback..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit Grade'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
