import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    User, 
    Home, 
    CheckCircle, 
    XCircle, 
    LogOut, 
    Loader2, 
    ClipboardList,
    ShieldCheck,
    AlertCircle,
    Building2,
    Calendar,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ManageAllocations = () => {
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'danger'
    });

    const fetchAllocations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/api/allocations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllocations(res.data);
        } catch (err) {
            toast.error('Could not load room allocations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllocations();
    }, []);

    const handleAction = async (id, action) => {
        try {
            setActionLoading(id);
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/allocations/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Request ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'vacated'} successfully`);
            fetchAllocations();
        } catch (err) {
            toast.error(err.response?.data?.msg || `Failed to ${action} allocation`);
        } finally {
            setActionLoading(null);
            setModalConfig(prev => ({ ...prev, isOpen: false }));
        }
    };

    const confirmAction = (id, action) => {
        const config = {
            approve: { title: 'Approve Request', message: 'Are you sure you want to approve this room allocation request?', type: 'primary' },
            reject: { title: 'Reject Request', message: 'Are you sure you want to reject this room request? This action cannot be undone.', type: 'danger' },
            vacate: { title: 'Mark Vacated', message: 'Is this student officially vacating the room? The room will be immediately available for new requests.', type: 'warning' }
        };

        setModalConfig({
            isOpen: true,
            title: config[action].title,
            message: config[action].message,
            type: config[action].type,
            onConfirm: () => handleAction(id, action)
        });
    };

    const filteredAllocations = allocations.filter(alloc => {
        const matchesSearch = 
            (alloc.studentId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (alloc.studentId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (alloc.studentId?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesFilter = filterStatus === 'All' || alloc.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="animate-fade-in text-slate-200">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Building2 className="text-indigo-500 w-8 h-8" />
                        Room Allocations
                    </h2>
                    <p className="text-slate-400 mt-2 font-medium tracking-wide">Orchestrate Student Accommodations & Requests</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                        />
                    </div>
                    
                    <div className="relative flex-1 sm:w-48">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full appearance-none bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all cursor-pointer font-medium"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Active">Active</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Vacated">Vacated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-32 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-[40px]">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Synchronizing Master Allocation Table</p>
                    </div>
                ) : filteredAllocations.length === 0 ? (
                    <div className="p-32 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-[40px]">
                        <ClipboardList className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-600 mb-2">No Matching Allocations</h3>
                        <p className="text-xs text-slate-700 font-black uppercase tracking-widest leading-relaxed">Your search query returned zero results.<br/>Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredAllocations.map(alloc => (
                            <div key={alloc._id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-slate-700 transition-all shadow-xl group relative overflow-hidden backdrop-blur-md">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                                
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
                                    {/* Student Profile Info */}
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner group-hover:scale-105 transition-transform overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                            {alloc.studentId?.profilePic ? (
                                                <img src={alloc.studentId.profilePic} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="text-slate-600 group-hover:text-indigo-400" size={32} />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-white tracking-tight">{alloc.studentId?.firstName} {alloc.studentId?.lastName}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                                                    ID: {alloc.studentId?.registrationNumber || 'N/A'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Calendar size={10} /> {new Date(alloc.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Room Assignment Details */}
                                    <div className="flex-1 lg:px-10 grid grid-cols-2 lg:grid-cols-2 gap-8 w-full">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                                <Home size={10} /> Assigned Room
                                            </p>
                                            <p className="text-lg font-bold text-indigo-400">{alloc.roomId?.roomNumber || 'PENDING'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Type / Capacity</p>
                                            <p className="text-sm font-black text-slate-300 uppercase tracking-tighter">{alloc.roomId?.type || 'Standard'} • {alloc.roomId?.capacity || 1} PAX</p>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex items-center gap-6 w-full lg:w-auto">
                                        <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-2xl flex items-center gap-2 ${
                                            alloc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            alloc.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${alloc.status === 'Active' ? 'bg-emerald-500' : alloc.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                            {alloc.status}
                                        </div>

                                        <div className="flex items-center gap-2 ml-auto">
                                            {alloc.status === 'Pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => confirmAction(alloc._id, 'approve')}
                                                        className="p-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl border border-emerald-500/20 transition-all active:scale-95"
                                                        title="Approve Allocation"
                                                    >
                                                        <CheckCircle size={20} />
                                                    </button>
                                                    <button 
                                                        onClick={() => confirmAction(alloc._id, 'reject')}
                                                        className="p-3 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl border border-rose-500/20 transition-all active:scale-95"
                                                        title="Reject Request"
                                                    >
                                                        <XCircle size={20} />
                                                    </button>
                                                </>
                                            )}
                                            {alloc.status === 'Active' && (
                                                <button 
                                                    onClick={() => confirmAction(alloc._id, 'vacate')}
                                                    className="px-6 py-3 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2 shadow-xl shadow-amber-900/20 active:scale-95"
                                                >
                                                    <LogOut size={16} /> Vacate Room
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </div>
    );
};

export default ManageAllocations;
