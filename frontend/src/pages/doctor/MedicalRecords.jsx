import { useEffect, useMemo, useState } from 'react'
import { FileText, Search, Filter, Download, Eye, PlusCircle, Edit2 } from 'lucide-react'
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
    return records.filter(r =>
      (r.title || '').toLowerCase().includes(q) ||
      (r.doctorName || '').toLowerCase().includes(q) ||
      (r.type || '').toLowerCase().includes(q)
    )
  }, [records, search])

  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (editingRecord) {
      // Update existing record
      try {
        const payload = {
          title,
          description,
          type,
          date: date || new Date().toISOString()
        }
        await updateMedicalRecord(editingRecord._id || editingRecord.id, payload, file)
        toast.success('Record updated successfully')
        setShowForm(false)
        setEditingRecord(null)
        setTitle('')
        setType('Report')
        setDate('')
        setDescription('')
        setFile(null)
        setPatientEmail('')
        fetchRecords()
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to update record')
      }
    } else {
      // Create new record
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
        setShowForm(false)
        setTitle('')
        setType('Report')
        setDate('')
        setDescription('')
        setFile(null)
        setPatientEmail('')
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

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medical Records</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage your medical reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search records"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-transparent border-0 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            <PlusCircle className="h-4 w-4" />
            New Record
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingRecord ? 'Edit Medical Record' : 'Create New Medical Record'}
            </h3>
          </div>
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              placeholder="Brief findings or instructions"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            >
              <option>Prescription</option>
              <option>Lab Test</option>
              <option>Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            />
          </div>
          {/* Time removed as requested */}
          <div>
            <label className="block text-sm mb-1">File</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              required={!editingRecord}
            />
            {editingRecord && (
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Leave empty to keep current file
              </p>
            )}
          </div>
          {!editingRecord && (
            <div>
              <label className="block text-sm mb-1">Patient Email</label>
              <input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                placeholder="Enter patient's email"
                required
              />
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Use the email visible in appointments.</p>
            </div>
          )}
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              {editingRecord ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((record) => (
            <div
              key={record._id || record.id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{record.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{record.type}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {new Date(record.date).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Doctor: {record.doctorName || user?.name}</div>
              {record.patient && (
                <div className="text-xs text-gray-500 dark:text-gray-400">Patient: {record.patient.name}</div>
              )}
              <div className="flex gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => handleEdit(record)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Edit2 className="h-4 w-4" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => viewFile(record.fileUrl)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700"
                >
                  <Eye className="h-4 w-4" /> View
                </button>
                <a
                  href={`${originBase}${record.fileUrl || ''}`}
                  download
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4" /> Download
                </a>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-600 dark:text-gray-400 py-8">
              No records found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
