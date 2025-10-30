import { useState, useEffect } from 'react';
import { BookOpen, Users, MessageSquare, Clock } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { id: 1, name: 'Completed Assignments', value: 12, icon: BookOpen, change: '+2 from last month' },
    { id: 2, name: 'Ongoing Trainings', value: 3, icon: Clock, change: '1 in progress' },
    { id: 3, name: 'Doctors Followed', value: 8, icon: Users, change: '+3 this month' },
    { id: 4, name: 'Community Posts', value: 24, icon: MessageSquare, change: '5 new replies' },
  ]);

  const [upcomingSessions, setUpcomingSessions] = useState([
    {
      id: 1,
      title: 'Cardiology Basics',
      instructor: 'Dr. Sarah Johnson',
      date: '2023-11-15',
      time: '10:00 AM - 11:30 AM',
      type: 'Live Session'
    },
    {
      id: 2,
      title: 'Patient Case Study Review',
      instructor: 'Dr. Michael Chen',
      date: '2023-11-17',
      time: '2:00 PM - 3:30 PM',
      type: 'Workshop'
    },
    {
      id: 3,
      title: 'Medical Ethics Discussion',
      instructor: 'Dr. Emily Wilson',
      date: '2023-11-20',
      time: '11:00 AM - 12:30 PM',
      type: 'Seminar'
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, Kiran! <span className="text-orange-500">👋</span>
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Track your learning progress and stay updated with your medical education journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-500">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Learning Sessions</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{session.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    With {session.instructor} • {session.type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{session.time}</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
                  Join Session
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
                  Add to Calendar
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-right">
          <button className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
            View all sessions →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
