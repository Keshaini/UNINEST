import { useState, useEffect } from 'react';
import { 
    Bell, 
    Check, 
    Trash2, 
    RefreshCw, 
    AlertCircle, 
    CheckCircle, 
    Info, 
    ShieldCheck, 
    Filter, 
    ChevronRight,
    Search,
    Loader2,
    CheckCircle2,
    Activity,
    Inbox,
    Sparkles
} from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from '../../services/paymentService';
import { toast } from 'react-toastify';
import ConfirmationModal from '../common/ConfirmationModal';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread
  const [unreadCount, setUnreadCount] = useState(0);

  // Modal State
  const [modal, setModal] = useState({
      isOpen: false,
      targetId: null
  });

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setRefreshing(true);
    try {
      const params = filter === 'unread' ? { unreadOnly: 'true' } : {};
      const response = await getNotifications(params);
      
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
      }
    } catch (err) {
      toast.error('Failed to synchronize global notification matrix.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      toast.success('Dossier marked as read.');
    } catch (err) {
      toast.error('Protocol alignment failure.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      toast.success('Matrix cleared. All dossiers synchronized.');
    } catch (err) {
      toast.error('Global mark-as-read failure.');
    }
  };

  const confirmDelete = (id) => {
      setModal({ isOpen: true, targetId: id });
  };

  const handleDelete = async () => {
    const id = modal.targetId;
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif._id !== id));
      toast.success('Intel purged successfully.');
    } catch (err) {
      toast.error('Intel purge failed.');
    } finally {
      setModal({ isOpen: false, targetId: null });
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'payment_reminder': Activity,
      'payment_success': CheckCircle2,
      'payment_failed': AlertCircle,
      'invoice_generated': Info,
      'overdue_warning': AlertCircle,
      'refund_approved': CheckCircle2,
      'refund_rejected': AlertCircle,
      'payment_verified': ShieldCheck,
      'payment_rejected': AlertCircle
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'indigo';
    if (type.includes('success') || type.includes('approved') || type.includes('verified')) {
      return 'emerald';
    }
    if (type.includes('failed') || type.includes('rejected') || type.includes('overdue')) {
      return 'rose';
    }
    return 'indigo';
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'JUST NOW';
    if (diffMins < 60) return `${diffMins}M AGO`;
    if (diffHours < 24) return `${diffHours}H AGO`;
    
    return notifDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    }).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 h-[80vh]">
        <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-6" />
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Synchronizing Intelligence Stream</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 p-6 lg:p-10 animate-fade-in">
      <div className="max-w-[1000px] mx-auto space-y-12">
        
        {/* Header section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
                    <Bell className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Notification Center</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                        {unreadCount > 0 
                          ? `${unreadCount} Anomalies detected in recent logs`
                          : 'Operational status: Optimized'
                        }
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchNotifications}
                className={`p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all active:scale-95 ${refreshing ? 'animate-spin-slow' : ''}`}
                title="Refresh Intel"
              >
                <RefreshCw size={18} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/20 transition-all active:scale-95"
                >
                  <Check size={14} /> Mark All Synchronized
                </button>
              )}
            </div>
        </header>

        {/* Filters and Search Bar Container */}
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-slate-900/60 p-2 rounded-2xl border border-slate-800 flex items-center gap-1 w-full md:w-auto">
              <FilterTab active={filter === 'all'} onClick={() => setFilter('all')} label="All Logs" />
              <FilterTab active={filter === 'unread'} onClick={() => setFilter('unread')} label={`Unread (${unreadCount})`} />
            </div>
            
            <div className="relative group flex-1 w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input type="text" placeholder="QUERY MASTER LOGS..." className="w-full bg-slate-900/40 border border-slate-800 rounded-[2rem] pl-16 pr-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] outline-none focus:border-indigo-500/50 transition-all" />
            </div>
        </div>

        {/* Intelligence Stream */}
        <div className="space-y-6">
            {notifications.length === 0 ? (
                <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem] p-24 text-center mt-10">
                    <Inbox className="w-20 h-20 text-slate-800 mx-auto mb-8 animate-pulse" />
                    <h3 className="text-xl font-black text-slate-600 tracking-widest uppercase">Void Detected</h3>
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-3">All clear. No incoming directives or status warnings found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 pb-20">
                    {notifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`group relative bg-slate-900 border transition-all rounded-[2.5rem] p-8 overflow-hidden hover:border-slate-700 ${
                                !notif.read ? 'border-indigo-500/50 shadow-2xl shadow-indigo-900/10' : 'border-slate-800 opacity-80'
                            }`}
                        >
                            {!notif.read && (
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                            )}
                            
                            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                {/* Leading Icon */}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                                    getNotificationColor(notif.type, notif.priority) === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                    getNotificationColor(notif.type, notif.priority) === 'rose' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                    'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                }`}>
                                    {React.createElement(getNotificationIcon(notif.type), { size: 24 })}
                                </div>

                                {/* Content Logic */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className={`text-lg font-black tracking-tight ${!notif.read ? 'text-white' : 'text-slate-400'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full whitespace-nowrap">
                                            {formatDate(notif.createdAt)}
                                        </span>
                                    </div>
                                    <p className={`text-sm font-medium leading-relaxed max-w-2xl ${!notif.read ? 'text-slate-300' : 'text-slate-500'}`}>
                                        {notif.message}
                                    </p>
                                    
                                    {/* Action Footnotes */}
                                    <div className="flex flex-wrap items-center gap-6 pt-6 mt-4 border-t border-slate-800/50">
                                        {notif.link && (
                                            <a
                                                href={notif.link}
                                                className="text-[9px] font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 group/link"
                                            >
                                                Execute Link <ChevronRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                                            </a>
                                        )}
                                        {!notif.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notif._id)}
                                                className="text-[9px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-2"
                                            >
                                                <CheckCircle size={12} /> Sync Log
                                            </button>
                                        )}
                                        <button
                                            onClick={() => confirmDelete(notif._id)}
                                            className="text-[9px] font-black text-slate-700 hover:text-rose-500 uppercase tracking-widest flex items-center gap-2 transition-colors ml-auto md:ml-0"
                                        >
                                            <Trash2 size={12} /> Purge Intel
                                        </button>
                                    </div>
                                </div>

                                {/* Unread Radar Indicator */}
                                {!notif.read && (
                                    <div className="absolute top-2 right-2 flex pointer-events-none">
                                        <div className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></div>
                                        <div className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      <ConfirmationModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, targetId: null })}
        onConfirm={handleDelete}
        title="Protocol Purge Initiative"
        message="Are you certain you wish to permanently de-materialize this intel from the global stream? This operation is irreversible."
        type="danger"
      />
    </div>
  );
}

// ====== SUBCOMPONENTS ======

const FilterTab = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            active 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                : 'text-slate-600 hover:text-slate-400'
        }`}
    >
        {label}
    </button>
);

export default NotificationCenter;
