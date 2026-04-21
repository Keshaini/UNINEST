import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Bell, User, LogOut, Settings, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSocketClient } from '../../common/socket/socketClient';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../services/paymentService';
import logo from '../../assets/logo.png';

const parseStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const resolveBackendOrigin = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  if (apiBaseUrl.startsWith('http')) {
    try {
      return new URL(apiBaseUrl).origin;
    } catch {
      return 'http://localhost:5000';
    }
  }
  return 'http://localhost:5000';
};

const BACKEND_ORIGIN = resolveBackendOrigin();

const resolveProfileImageUrl = (imagePath = '') => {
  const trimmedPath = typeof imagePath === 'string' ? imagePath.trim() : '';
  if (!trimmedPath) return '';
  if (trimmedPath.startsWith('data:image') || trimmedPath.startsWith('http')) return trimmedPath;
  return `${BACKEND_ORIGIN}${trimmedPath}`;
};

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

const resolveStudentUserId = (storedUser, profile) => {
  if (storedUser?.id) return String(storedUser.id);
  if (storedUser?._id) return String(storedUser._id);
  if (typeof profile?.userId === 'string') return String(profile.userId);
  if (profile?.userId?._id) return String(profile.userId._id);
  if (profile?.userId?.id) return String(profile.userId.id);
  return '';
};

const StudentNavbar = ({ profile }) => {
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const notificationsDropdownRef = useRef(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [storedUser, setStoredUser] = useState(() => parseStoredUser());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);

  const mergedProfile = profile || {};
  const studentName = useMemo(() => {
    const fullName = [mergedProfile?.firstName, mergedProfile?.lastName].filter(Boolean).join(' ').trim();
    return fullName || storedUser?.name || 'Student Name';
  }, [mergedProfile?.firstName, mergedProfile?.lastName, storedUser?.name]);
  const firstInitial = studentName?.trim()?.charAt(0)?.toUpperCase() || 'S';
  const studentEmail = mergedProfile?.userId?.email || storedUser?.email || 'Student';
  const profilePic = mergedProfile?.profilePic || storedUser?.profilePic || '';
  const studentUserId = useMemo(() => resolveStudentUserId(storedUser, mergedProfile), [storedUser, mergedProfile]);

  const fetchNotifications = async () => {
    setIsNotificationsLoading(true);
    try {
      const response = await getNotifications({ limit: 12 });
      if (response?.success) {
        setNotifications(response.data || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch {
      // keep navbar resilient to temporary request errors
    } finally {
      setIsNotificationsLoading(false);
    }
  };

  useEffect(() => {
    const updateUser = () => setStoredUser(parseStoredUser());
    window.addEventListener('storage', updateUser);
    window.addEventListener('user-profile-updated', updateUser);
    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('user-profile-updated', updateUser);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!studentUserId) return undefined;
    const socket = getSocketClient();

    const subscribe = () => {
      socket.emit('notifications:subscribe', { userId: studentUserId });
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
      socket.emit('notifications:unsubscribe', { userId: studentUserId });
      socket.off('connect', subscribe);
      socket.off('notification:new', onNotification);
    };
  }, [studentUserId]);

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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
      // no-op, preserve current UI state
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount <= 0) return;
    try {
      await markAllNotificationsAsRead();
      setNotifications((previous) =>
        previous.map((entry) => ({ ...entry, read: true, readAt: entry.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // no-op, preserve current UI state
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) await handleMarkNotificationAsRead(notification._id);
    setIsNotificationsOpen(false);

    if (notification.link && notification.link.startsWith('/')) {
      navigate(notification.link);
      return;
    }

    if (notification.type?.startsWith('complaint_')) {
      navigate('/complaints/student/tickets');
    }
  };

  return (
    <nav className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-40 relative shadow-sm w-full shrink-0">
      <div className="flex items-center">
        <img
          src={logo}
          alt="HostelPro Logo"
          className="w-[45px] h-auto object-contain drop-shadow-[0_4px_12px_rgba(99,102,241,0.3)] mr-[10px]"
        />
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-wide hidden sm:block">
          HostelPro
        </h2>
      </div>

      <div className="flex-1 max-w-xl mx-auto ml-4 sm:ml-6 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search notices, payments..."
            className="w-full bg-slate-800/40 border border-slate-700 text-slate-200 text-sm rounded-full pl-12 pr-4 py-2.5 outline-none focus:border-indigo-500/50 focus:bg-slate-800/80 transition-all placeholder:text-slate-500 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center space-x-5 ml-auto relative">
        <div className="relative" ref={notificationsDropdownRef}>
          <button
            type="button"
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
                        <p className={`text-sm font-semibold ${notification.read ? 'text-slate-200' : 'text-white'}`}>
                          {notification.title}
                        </p>
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

        <div className="flex items-center space-x-4 pl-5 border-l border-slate-800 relative" ref={profileDropdownRef}>
          <button
            type="button"
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => {
              setIsProfileDropdownOpen((previous) => !previous);
              setIsNotificationsOpen(false);
            }}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-100 tracking-wide">{studentName}</p>
              <p className="text-xs text-indigo-400 font-medium uppercase tracking-widest">STUDENT</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner overflow-hidden hover:ring-2 hover:ring-indigo-500/50 transition-all">
              {profilePic ? (
                <img src={resolveProfileImageUrl(profilePic)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-lg">{firstInitial}</span>
              )}
            </div>
          </button>

          {isProfileDropdownOpen ? (
            <div className="absolute right-0 top-full mt-3 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-fade-in origin-top-right text-left">
              <div className="px-4 py-3 border-b border-slate-700/50 mb-1">
                <p className="text-sm font-semibold text-white truncate">{studentName}</p>
                <p className="text-xs text-slate-400 truncate">{studentEmail}</p>
              </div>

              <button
                onClick={() => {
                  navigate('/student/profile');
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center gap-3 transition-colors"
              >
                <User className="w-4 h-4" /> View Profile
              </button>

              <button
                onClick={() => {
                  navigate('/student/profile?edit=true');
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center gap-3 transition-colors"
              >
                <Settings className="w-4 h-4" /> Edit Profile
              </button>

              <div className="h-px bg-slate-700/50 my-1"></div>

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

export default StudentNavbar;
