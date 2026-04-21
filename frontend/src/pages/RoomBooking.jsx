import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    Home, 
    Info, 
    User, 
    Loader2, 
    Sparkles, 
    AlertCircle, 
    Building2, 
    Calendar, 
    ArrowRight,
    Users,
    ShieldCheck
} from 'lucide-react';
import StudentNavbar from '../components/studentDashboard/StudentNavbar';
import ConfirmationModal from '../components/common/ConfirmationModal';

function RoomBooking() {
    const [rooms, setRooms] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [requestLoading, setRequestLoading] = useState(null);

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        roomId: null,
        roomNumber: ''
    });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [roomsRes, allocsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/rooms', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/allocations', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            setRooms(roomsRes.data);
            setAllocations(allocsRes.data);
        } catch (err) {
            toast.error('Failed to synchronize room matrix.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) setProfile(JSON.parse(userStr));
        fetchData();
    }, []);

    const handleRequest = async (roomId) => {
        try {
            setRequestLoading(roomId);
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/allocations/request', { roomId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Room request synthesized & broadcasted to admin.');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Booking synthesis failed.');
        } finally {
            setRequestLoading(null);
            setModal({ isOpen: false, roomId: null, roomNumber: '' });
        }
    };

    const hasActiveOrPending = allocations.some(a => a.status === 'Active' || a.status === 'Pending');
    const myCurrentAlloc = allocations.find(a => a.status === 'Active' || a.status === 'Pending');

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans selection:bg-indigo-500/30">
            <StudentNavbar profile={profile} />
            
            <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-10 animate-fade-in">
                {/* Header section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 mb-2">Accommodations Directory</p>
                        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                            <Building2 className="text-indigo-500 w-10 h-10" />
                            Explore Rooms
                        </h1>
                        <p className="text-slate-500 font-medium mt-3 tracking-wide">Browse available hostel suites and manage your residency status.</p>
                    </div>
                </header>

                {/* Status Banner */}
                {myCurrentAlloc && (
                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-900/20">
                                    <ShieldCheck className="text-white" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight">Active Residency Detected</h3>
                                    <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                                        Current Status: <span className="text-white underline underline-offset-4 decoration-indigo-500/50">{myCurrentAlloc.status}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 w-full md:w-auto bg-slate-950/40 p-6 rounded-[2rem] border border-slate-800">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Designated Suite</p>
                                    <p className="text-lg font-black text-white uppercase">{myCurrentAlloc.roomId?.roomNumber}</p>
                                </div>
                                <div className="w-px h-10 bg-slate-800"></div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Suite Category</p>
                                    <p className="text-sm font-black text-indigo-400 uppercase tracking-tighter">{myCurrentAlloc.roomId?.type}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rooms Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-slate-900/40 border border-dashed border-slate-800 rounded-[3rem]">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Synchronizing Suite Availability Architecture</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                        {rooms.map(room => (
                            <div key={room._id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-slate-700 transition-all shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
                                
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tighter mb-1 uppercase">{room.roomNumber}</h2>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Building2 size={12} className="text-indigo-500" /> {room.type} Suite
                                        </span>
                                    </div>
                                    <StatusBadge status={room.status} />
                                </div>

                                <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800/50 mb-8 relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Users size={16} className="text-slate-600" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Occupancy</span>
                                        </div>
                                        <span className="text-sm font-black text-white">{room.currentOccupancy} / {room.capacity}</span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-700 ${room.currentOccupancy >= room.capacity ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]'}`}
                                            style={{ width: `${(room.currentOccupancy/room.capacity)*100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setModal({ isOpen: true, roomId: room._id, roomNumber: room.roomNumber })}
                                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 relative z-10 ${
                                        (room.status === 'Available' && !hasActiveOrPending) 
                                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-900/20 active:scale-95' 
                                            : 'bg-slate-950 border border-slate-800 text-slate-600 cursor-not-allowed'
                                    }`}
                                    disabled={room.status !== 'Available' || hasActiveOrPending || requestLoading}
                                >
                                    {requestLoading === room._id ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : hasActiveOrPending ? (
                                        <>Already Linked <ShieldCheck size={16} /></>
                                    ) : room.status === 'Available' ? (
                                        <>Request Allocation <ArrowRight size={16} /></>
                                    ) : (
                                        <>Unavailable Suite <AlertCircle size={16} /></>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={modal.isOpen}
                onClose={() => setModal({ isOpen: false, roomId: null, roomNumber: '' })}
                onConfirm={() => handleRequest(modal.roomId)}
                title="Synthesize Allocation Request"
                message={`Are you sure you want to request allocation for Suite ${modal.roomNumber}? This request will be broadcasted to the central administrative unit for verification.`}
                type="primary"
            />
        </div>
    );
}

// ====== SUBCOMPONENTS ======

const StatusBadge = ({ status }) => {
    const style = status === 'Available' 
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
        : status === 'Full' 
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]' 
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]';

    return (
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${style}`}>
            {status}
        </span>
    );
};

export default RoomBooking;
