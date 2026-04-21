import React, { useState, useEffect } from 'react';
import { 
    getComplaints, 
    updateComplaint 
} from '../../services/complaintsService';
import { 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    Trash2, 
    ShieldAlert, 
    RefreshCw, 
    Search, 
    Filter, 
    ChevronRight, 
    Activity, 
    MessageSquare,
    Loader2,
    Calendar,
    User,
    Home,
    AlertTriangle,
    Eye
} from 'lucide-react';
import { toast } from 'react-toastify';

const ManageComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Fetch all complaints via service
    const fetchAllComplaints = async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true);
            else setLoading(true);
            
            const response = await getComplaints();
            setComplaints(response.data || response);
        } catch (err) {
            toast.error('Intelligence Stream Synchronization Failure');
            setComplaints([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllComplaints();
    }, []);

    // Update complaint status
    const updateStatus = async (id, newStatus) => {
        const previousState = [...complaints];
        try {
            // Optimistic UI update
            setComplaints(complaints.map(c => c._id === id ? { ...c, status: newStatus } : c));

            const payload = { status: newStatus };
            if (newStatus === 'resolved') {
                payload.supportNotes = 'The maintenance team successfully resolved this request.';
            }

            await updateComplaint(id, payload);
            toast.success(`Protocol ${newStatus.replace('_', ' ')} updated.`);
        } catch (err) {
            toast.error('State reconciliation failure.');
            // Revert UI on error
            setComplaints(previousState);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'in_progress': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'high': return 'text-rose-500 font-black';
            case 'medium': return 'text-amber-500 font-bold';
            case 'low': return 'text-emerald-500 font-bold';
            default: return 'text-slate-500';
        }
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = 
            (c.studentName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Synchronizing Complaint Matrix</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-12 pb-20">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-rose-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Complaint Matrix</h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 flex items-center gap-2">
                            <Activity size={12} className="text-emerald-500" />
                            Live Operational Awareness: {complaints.length} Records
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchAllComplaints(true)}
                        className={`p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all active:scale-95 ${refreshing ? 'animate-spin-slow' : ''}`}
                    >
                        <RefreshCw size={18} />
                    </button>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-1 flex gap-1">
                        <FilterButton active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} label="All" />
                        <FilterButton active={filterStatus === 'pending'} onClick={() => setFilterStatus('pending')} label="Pending" />
                    </div>
                </div>
            </header>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative group flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search className="text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="SEARCH LOGS BY NAME, ROOM, OR INTEL..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] pl-16 pr-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] outline-none focus:border-indigo-500/50 transition-all font-sans" 
                    />
                </div>
                
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl w-full md:w-auto">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 hidden lg:inline">Priority Hierarchy:</span>
                    <div className="flex gap-1">
                        <span className="px-3 py-1 text-[9px] font-black uppercase text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg">High</span>
                        <span className="px-3 py-1 text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg">Medium</span>
                        <span className="px-3 py-1 text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">Low</span>
                    </div>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/40 border-b border-slate-800">
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Intel Ref</th>
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Student Narrative</th>
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Context</th>
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status Directive</th>
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Operation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {filteredComplaints.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-32 text-center">
                                        <MessageSquare className="w-16 h-16 text-slate-800 mx-auto mb-8 animate-pulse" />
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">No matching anomalies detected in synchronization stream</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredComplaints.map((c) => (
                                    <tr key={c._id} className="group hover:bg-slate-800/20 transition-all duration-300">
                                        <td className="p-8">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-indigo-500 tracking-widest uppercase bg-indigo-500/5 px-2 py-1 rounded">#{c._id?.substring(0, 8).toUpperCase()}</span>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                                                    <Calendar size={10} /> {new Date(c.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="max-w-md space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                                        c.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                        c.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    }`}>
                                                        {c.priority || 'Normal'}
                                                    </span>
                                                    <h3 className="text-sm font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">{c.title}</h3>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-1 group-hover:line-clamp-none transition-all duration-500">"{c.description}"</p>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 shadow-inner">
                                                        <User size={14} className="text-slate-500" />
                                                    </div>
                                                    <span className="text-sm font-bold tracking-tight">{c.studentName || 'Unknown Student'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-500 pl-1">
                                                    <Home size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Room {c.roomNumber || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="relative">
                                                <select 
                                                    value={c.status} 
                                                    onChange={(e) => updateStatus(c._id, e.target.value)}
                                                    className={`appearance-none w-full min-w-[140px] px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border outline-none transition-all cursor-pointer shadow-xl ${getStatusStyles(c.status)}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                    <ChevronRight size={14} className="rotate-90" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <button className="p-4 bg-slate-950 border border-slate-800 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 rounded-2xl transition-all active:scale-95 group/btn">
                                                <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Footer Intel */}
            <footer className="text-center">
                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Proprietary Administrative Conflict Management System • v4.2.0-DARK</p>
            </footer>
        </div>
    );
};

const FilterButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all ${
            active 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' 
                : 'text-slate-600 hover:text-slate-400'
        }`}
    >
        {label}
    </button>
);

export default ManageComplaints;
