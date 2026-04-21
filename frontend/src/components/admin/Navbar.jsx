import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck, Menu, Search, Settings, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSocketClient } from '../../common/socket/socketClient';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../services/paymentService';

const formatRelativeTime = (date) => {
  const now = Date.now();
  const target = new Date(date).getTime();
  if (!Number.isFinite(target)) return '';

  const diffMs = Math.max(0, now - target);
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / (60 * 60000));
  const days = Math.floor(diffMs / (24 * 60 * 60000));

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(target).toLocaleDateString();
};

const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen, setActiveTab }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Admin User', role: 'admin' });
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const profileDropdownRef = useRef(null);
  const notificationsDropdownRef = useRef(null);

  const adminUserId = useMemo(() => {
    if (user?.id) return String(user.id);
    try {
      const rawAdminUser = localStorage.getItem('adminUser');
      if (!rawAdminUser) return '';
      const parsedAdminUser = JSON.parse(rawAdminUser);
      return parsedAdminUser?.id ? String(parsedAdminUser.id) : '';
    } catch {
      return '';
    }
  }, [user]);

  const loadUserFromStorage = () => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser({ name: 'Admin User', role: 'admin' });
      }
    }
  };

  const fetchNotifications = async () => {
    setIsNotificationsLoading(true);
    try {
      const response = await getNotifications({ limit: 12 });
      if (response?.success) {
        setNotifications(response.data || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch {
      // ignore fetch errors in navbar
    } finally {
      setIsNotificationsLoading(false);
    }
  };

  useEffect(() => {
    loadUserFromStorage();
    window.addEventListener('user-profile-updated', loadUserFromStorage);
    return () => {
      window.removeEventListener('user-profile-updated', loadUserFromStorage);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!adminUserId) return undefined;
    const socket = getSocketClient();

    const subscribe = () => {
      socket.emit('notifications:subscribe', { userId: adminUserId });
    };

    const onNotification = (incomingNotification = {}) => {
      if (!incomingNotification?._id) return;
      setNotifications((previous) => {
        const alreadyExists = previous.some((entry) => entry._id === incomingNotification._id);
        if (!alreadyExists && !incomingNotification.read) {
          setUnreadCount((prevCount) => prevCount + 1);
        }
        return [incomingNotification, ...previous.filter((entry) => entry._id !== incomingNotification._id)].slice(0, 12);
      });
    };

    socket.on('connect', subscribe);
    socket.on('notification:new', onNotification);
    if (socket.connected) subscribe();

    return () => {
      socket.emit('notifications:unsubscribe', { userId: adminUserId });
      socket.off('connect', subscribe);
      socket.off('notification:new', onNotification);
    };
  }, [adminUserId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    const target = notifications.find((item) => item._id === notificationId);
    if (!target || target.read) return;

    try {
      await markNotificationAsRead(notificationId);
      setNotifications((previous) =>
        previous.map((entry) =>
          entry._id === notificationId ? { ...entry, read: true, readAt: new Date().toISOString() } : entry
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      // ignore mark-read failures in navbar
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount <= 0) return;
    try {
      await markAllNotificationsAsRead();
      setNotifications((previous) => previous.map((entry) => ({ ...entry, read: true, readAt: entry.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // ignore failures in navbar
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) await handleMarkNotificationAsRead(notification._id);
    setIsNotificationsOpen(false);

    if (notification.type?.startsWith('complaint_')) {
      navigate('/admin');
      setActiveTab('Support Service');
      return;
    }

    if (notification.link && notification.link.startsWith('/')) {
      navigate(notification.link);
    }
  };

  return (
    <nav className="h-20 bg-[#0B1120]/90 backdrop-blur-xl border-b border-[#1e293b] flex items-center justify-between px-6 md:px-8 z-40 sticky top-0 shadow-sm">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-[#1e293b] rounded-lg transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1 max-w-xl hidden md:block ml-4 md:ml-0">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search students, rooms, payments..."
            className="w-full bg-[#1e293b]/50 border border-[#1e293b] text-slate-200 text-sm rounded-full pl-12 pr-4 py-2.5 outline-none focus:border-indigo-500/50 focus:bg-[#1e293b] transition-all placeholder:text-slate-500 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center space-x-5 ml-auto relative">
        <div className="relative" ref={notificationsDropdownRef}>
          <button
            className="relative p-2 rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-all"
            onClick={() => {
              setIsNotificationsOpen((previous) => !previous);
              setIsProfileDropdownOpen(false);
            }}
            aria-label="Open notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-[10px] font-bold text-white grid place-items-center shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>

          {isNotificationsOpen ? (
            <div className="absolute right-0 top-full mt-3 w-[360px] max-w-[90vw] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/70 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <p className="text-xs text-slate-400">{unreadCount} unread</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-xs text-slate-300 hover:text-white transition-colors"
                    onClick={fetchNotifications}
                    disabled={isNotificationsLoading}
                  >
                    {isNotificationsLoading ? 'Loading...' : 'Refresh'}
                  </button>
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors inline-flex items-center gap-1"
                      onClick={handleMarkAllAsRead}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet.</div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-800/60 hover:bg-slate-800/50 transition-colors ${
                        !notification.read ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${notification.read ? 'text-slate-200' : 'text-white'}`}>{notification.title}</p>
                        {!notification.read ? <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" /> : null}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-[11px] text-slate-500 mt-2">{formatRelativeTime(notification.createdAt)}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div
          className="flex items-center space-x-4 pl-5 border-l border-slate-800 relative cursor-pointer"
          onClick={() => {
            setIsProfileDropdownOpen((previous) => !previous);
            setIsNotificationsOpen(false);
          }}
          ref={profileDropdownRef}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-100 tracking-wide">{user.name || 'Admin User'}</p>
            <p className="text-xs text-indigo-400 font-medium uppercase tracking-widest">{user.role || 'Admin'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner overflow-hidden hover:ring-2 hover:ring-indigo-500/50 transition-all">
            {user.profilePic ? (
              <img src={`http://localhost:5000${user.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold">{user.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
            )}
          </div>

          {isProfileDropdownOpen ? (
            <div className="absolute right-0 top-full mt-3 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-fade-in origin-top-right">
              <div className="px-4 py-3 border-b border-slate-700/50 mb-1">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email || 'Admin'}</p>
              </div>

              <button
                onClick={() => {
                  setActiveTab('Profile');
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center gap-3 transition-colors"
              >
                <User className="w-4 h-4" /> View Profile
              </button>

              <button
                onClick={() => {
                  setActiveTab('Profile');
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center gap-3 transition-colors"
              >
                <Settings className="w-4 h-4" /> Edit Profile
              </button>

              <div className="h-px bg-slate-700/50 my-1" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
