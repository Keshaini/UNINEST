import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from '../../services/paymentService';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { unreadOnly: 'true' } : {};
      const response = await getNotifications(params);
      
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;

    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'payment_reminder': AlertCircle,
      'payment_success': CheckCircle,
      'payment_failed': AlertCircle,
      'invoice_generated': Info,
      'overdue_warning': AlertCircle,
      'refund_approved': CheckCircle,
      'refund_rejected': AlertCircle,
      'payment_verified': CheckCircle,
      'payment_rejected': AlertCircle
    };
    return icons[type] || Info;
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-red-600 bg-red-100';
    if (type.includes('success') || type.includes('approved') || type.includes('verified')) {
      return 'text-green-600 bg-green-100';
    }
    if (type.includes('failed') || type.includes('rejected') || type.includes('overdue')) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-blue-600 bg-blue-100';
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return notifDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 
                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : 'All caught up!'
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchNotifications}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Notifications
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'You\'re all caught up! No unread notifications.'
                : 'You don\'t have any notifications yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type, notification.priority);

              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow ${
                    !notification.read ? 'border-l-4 border-indigo-600' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-600'} mb-2`}>
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {notification.link && (
                          <a
                            href={notification.link}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            View Details →
                          </a>
                        )}
                        
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-xs text-gray-600 hover:text-gray-900 flex items-center"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark as read
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center ml-auto"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationCenter;
