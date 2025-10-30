import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/student/dashboard')
      setDashboard(response.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Student Dashboard</h1>
        
        {loading ? <div>Loading...</div> : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Assigned Patients</h2>
              {dashboard?.assignments?.length === 0 ? (
                <p className="text-gray-500">No assignments yet</p>
              ) : (
                <div className="space-y-3">
                  {dashboard?.assignments?.map(assignment => (
                    <div key={assignment._id} className="border p-3 rounded">
                      <p className="font-semibold dark:text-white">Patient: {assignment.patientId?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Doctor: Dr. {assignment.doctorId?.name} - {assignment.doctorId?.specialization}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Case Studies</h2>
              {dashboard?.caseStudies?.length === 0 ? (
                <p className="text-gray-500">No case studies submitted yet</p>
              ) : (
                <div className="space-y-3">
                  {dashboard?.caseStudies?.slice(0, 5).map(caseStudy => (
                    <div key={caseStudy._id} className="border p-3 rounded">
                      <p className="font-semibold dark:text-white">{caseStudy.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Patient: {caseStudy.patientId?.name}
                      </p>
                      {caseStudy.grade && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-sm mt-2">
                          Grade: {caseStudy.grade}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard

