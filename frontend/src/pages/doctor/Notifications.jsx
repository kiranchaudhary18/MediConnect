import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead, deleteNotification } from '../../services/patientService';
import { useNavigate } from 'react-router-dom';

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openNotification = async (n) => {
    try {
      await markNotificationRead(n._id || n.id);
    } catch (err) {
      console.error('mark read failed', err);
    }
    setNotifications((prev) => prev.map((x) => (x._id === (n._id || n.id) || x.id === (n._id || n.id) ? { ...x, read: true } : x)));
    setSelected(n);
  };

  const handleDelete = async (n) => {
    try {
      const res = await deleteNotification(n._id || n.id);
      setNotifications((prev) => prev.filter((x) => (x._id || x.id) !== (n._id || n.id)));
      console.log(res?.message || 'Notification deleted');
    } catch (err) {
      console.error('delete failed', err);
      const msg = err?.response?.data?.message || err.message || 'Delete failed';
      console.error(msg);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">All Notifications</h2>
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="text-sm text-primary-600 hover:underline"
        >
          Back to dashboard
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-500">No notifications found.</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id || n.id}
              className={`p-4 rounded-lg border ${n.read ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800/40'} cursor-pointer`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1" onClick={() => openNotification(n)}>
                  <div className="font-medium text-gray-900 dark:text-white">{n.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{n.message}</div>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                  <div className="text-xs text-gray-400">{n.time || new Date(n.createdAt || Date.now()).toLocaleString()}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(n); }}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                    aria-label="Delete notification"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple modal for selected notification */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-xl w-full mx-4 p-6 z-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.title}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{selected.time || new Date(selected.createdAt || Date.now()).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">Close</button>
            </div>
            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">{selected.message}</div>
            <div className="mt-6 text-right">
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
