import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead, deleteNotification } from '../../services/patientService';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2, ArrowLeft, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Notifications() {
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
      await deleteNotification(n._id || n.id);
      setNotifications((prev) => prev.filter((x) => (x._id || x.id) !== (n._id || n.id)));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('delete failed', err);
      toast.error('Failed to delete notification');
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(n => markNotificationRead(n._id || n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Notifications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Bell className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
          <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {notifications.map((n, idx) => (
            <div
              key={n._id || n.id}
              className={`p-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                idx !== notifications.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
              } ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
            >
              {/* Indicator */}
              <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              
              {/* Content */}
              <div className="flex-1 min-w-0" onClick={() => openNotification(n)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{n.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{n.message}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {new Date(n.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
              
              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(n); }}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal for selected notification */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(selected.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300">{selected.message}</p>
            </div>
            <div className="px-4 pb-4 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}