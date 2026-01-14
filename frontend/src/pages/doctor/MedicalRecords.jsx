import { useEffect, useMemo, useState } from 'react'
import { FileText, Search, Filter, Download, Eye, PlusCircle, Edit2, X, Upload, Calendar, User, File, Trash2, ClipboardList } from 'lucide-react'
import { getDoctorMedicalRecords, uploadMedicalRecord, updateMedicalRecord } from '../../services/patientService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function MedicalRecords() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [filterType, setFilterType] = useState('all')

  // form state
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Report')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [patientEmail, setPatientEmail] = useState('')

  const originBase = useMemo(() => {
    const api = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    return api.replace(/\/?api\/?$/, '')
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const data = await getDoctorMedicalRecords()
      setRecords(Array.isArray(data) ? data : [])
    } catch (e) {
      toast.error('Failed to load records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return records.filter(r => {
      const matchesSearch = (r.title || '').toLowerCase().includes(q) ||
        (r.doctorName || '').toLowerCase().includes(q) ||
        (r.type || '').toLowerCase().includes(q)
      const matchesType = filterType === 'all' || r.type === filterType
      return matchesSearch && matchesType
    })
  }, [records, search, filterType])

  const stats = useMemo(() => ({
    total: records.length,
    prescriptions: records.filter(r => r.type === 'Prescription').length,
    labTests: records.filter(r => r.type === 'Lab Test').length,
    reports: records.filter(r => r.type === 'Report').length
  }), [records])

  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (editingRecord) {
      try {
        const payload = {
          title,
          description,
          type,
          date: date || new Date().toISOString()
        }
        await updateMedicalRecord(editingRecord._id || editingRecord.id, payload, file)
        toast.success('Record updated successfully')
        handleCancelEdit()
        fetchRecords()
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to update record')
      }
    } else {
      if (!file) return toast.error('Please attach a file')
      try {
        const payload = {
          title,
          description,
          doctorName: user?.name || 'Doctor',
          date: date || new Date().toISOString(),
          type,
          patientEmail
        }
        await uploadMedicalRecord(file, payload)
        toast.success('Record created')
        handleCancelEdit()
        fetchRecords()
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to create record')
      }
    }
  }

  const viewFile = (fileUrl) => {
    if (!fileUrl) return
    window.open(`${originBase}${fileUrl}`, '_blank')
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setTitle(record.title || '')
    setType(record.type || 'Report')
    setDate(record.date ? new Date(record.date).toISOString().split('T')[0] : '')
    setDescription(record.description || '')
    setPatientEmail('')
    setFile(null)
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setShowForm(false)
    setEditingRecord(null)
    setTitle('')
    setType('Report')
    setDate('')
    setDescription('')
    setFile(null)
    setPatientEmail('')
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Prescription': return 'from-violet-500 to-purple-500'
      case 'Lab Test': return 'from-amber-500 to-orange-500'
      case 'Report': return 'from-emerald-500 to-teal-500'
      default: return 'from-blue-500 to-cyan-500'
    }
  }

  const getTypeBg = (type) => {
    switch (type) {
      case 'Prescription': return 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
      case 'Lab Test': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
      case 'Report': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white shadow-lg shadow-teal-500/25">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <ClipboardList className="h-6 w-6" />
              </div>
              Medical Records
            </h1>
            <p className="mt-1 text-teal-100">Manage and track patient medical documents</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all duration-300 hover:scale-105"
          >
            <PlusCircle className="h-5 w-5" />
            New Record
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Records</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-5 border border-violet-100 dark:border-violet-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-violet-600 dark:text-violet-400">Prescriptions</p>
              <p className="text-3xl font-bold text-violet-700 dark:text-violet-300 mt-1">{stats.prescriptions}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25">
              <ClipboardList className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-5 border border-amber-100 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Lab Tests</p>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 mt-1">{stats.labTests}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25">
              <File className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Reports</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{stats.reports}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records by title, doctor or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {['all', 'Prescription', 'Lab Test', 'Report'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === t
                  ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25">
                    {editingRecord ? <Edit2 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editingRecord ? 'Edit Medical Record' : 'Create New Record'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {editingRecord ? 'Update the record details' : 'Add a new medical document'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={onSubmit} className="p-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Record title"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    <option>Prescription</option>
                    <option>Lab Test</option>
                    <option>Report</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief findings or instructions"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                  <div className="relative">
                    <Calendar className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                {!editingRecord && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient Email</label>
                    <div className="relative">
                      <User className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="patient@email.com"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  File {!editingRecord && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                    required={!editingRecord}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-3 w-full px-4 py-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer transition-all group"
                  >
                    <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      {file ? (
                        <p className="font-medium text-teal-600 dark:text-teal-400">{file.name}</p>
                      ) : (
                        <>
                          <p className="font-medium text-gray-700 dark:text-gray-300">Click to upload file</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">PDF or Image files accepted</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                {editingRecord && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Leave empty to keep current file
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:scale-105"
                >
                  {editingRecord ? 'Update Record' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-teal-200 border-t-teal-500 animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading records...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center">
            <FileText className="h-12 w-12 text-teal-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No records found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first medical record to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:scale-105"
          >
            <PlusCircle className="h-5 w-5" />
            Create Record
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((record) => (
            <div
              key={record._id || record.id}
              className="group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Gradient accent bar */}
              <div className={`h-1 bg-gradient-to-r ${getTypeColor(record.type)}`}></div>
              
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${getTypeColor(record.type)} text-white shadow-lg`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{record.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeBg(record.type)}`}>
                        {record.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(record)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-500 transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    <span>{record.doctorName || user?.name}</span>
                  </div>
                  {record.patient && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      <span>Patient: {record.patient.name}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => viewFile(record.fileUrl)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <a
                    href={`${originBase}${record.fileUrl || ''}`}
                    download
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all hover:scale-105"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
