import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [apps, prescs, docs] = await Promise.all([
        axios.get('/api/patient/appointments'),
        axios.get('/api/patient/prescriptions'),
        axios.get('/api/patient/doctors')
      ])
      setAppointments(apps.data)
      setPrescriptions(prescs.data)
      setDoctors(docs.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8 dark:text-white">Patient Dashboard</h1>
        
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">My Appointments</h2>
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No appointments yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {appointments.map(apt => (
                    <div key={apt._id} className="border-b pb-3 dark:border-gray-700">
                      <p className="font-semibold dark:text-white text-sm sm:text-base">{apt.doctorId?.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {new Date(apt.date).toLocaleDateString()} at {apt.time}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                        apt.status === 'approved' ? 'bg-green-100 text-green-800' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">Prescriptions</h2>
              {prescriptions.length === 0 ? (
                <p className="text-gray-500 text-sm">No prescriptions yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {prescriptions.slice(0, 5).map(presc => (
                    <div key={presc._id} className="border-b pb-3 dark:border-gray-700">
                      <p className="font-semibold dark:text-white text-sm sm:text-base">Dr. {presc.doctorId?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{presc.diagnosis}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(presc.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow lg:col-span-2">
              <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">Available Doctors</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.length === 0 ? (
                  <p className="text-gray-500">No doctors available</p>
                ) : (
                  doctors.map(doctor => (
                    <div key={doctor._id} className="border p-3 sm:p-4 rounded-lg hover:shadow-md transition">
                      <p className="font-semibold dark:text-white">Dr. {doctor.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.specialization}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientDashboard

