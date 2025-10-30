import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import axios from 'axios'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/analytics')
      ])
      setUsers(usersRes.data)
      setAnalytics(analyticsRes.data)
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
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin Dashboard</h1>
        
        {loading ? <div>Loading...</div> : (
          <>
            {analytics && (
              <div className="grid gap-4 md:grid-cols-5 mb-8">
                <div className="bg-blue-500 text-white p-6 rounded-lg">
                  <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                  <p>Total Users</p>
                </div>
                <div className="bg-green-500 text-white p-6 rounded-lg">
                  <p className="text-2xl font-bold">{analytics.totalDoctors}</p>
                  <p>Doctors</p>
                </div>
                <div className="bg-purple-500 text-white p-6 rounded-lg">
                  <p className="text-2xl font-bold">{analytics.totalPatients}</p>
                  <p>Patients</p>
                </div>
                <div className="bg-orange-500 text-white p-6 rounded-lg">
                  <p className="text-2xl font-bold">{analytics.totalStudents}</p>
                  <p>Students</p>
                </div>
                <div className="bg-red-500 text-white p-6 rounded-lg">
                  <p className="text-2xl font-bold">{analytics.totalAppointments}</p>
                  <p>Appointments</p>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 dark:text-white">All Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 dark:text-white">Name</th>
                      <th className="text-left py-2 dark:text-white">Email</th>
                      <th className="text-left py-2 dark:text-white">Role</th>
                      <th className="text-left py-2 dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id} className="border-b">
                        <td className="py-2 dark:text-white">{user.name}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">{user.email}</td>
                        <td className="py-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard


