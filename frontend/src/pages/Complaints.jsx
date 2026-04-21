import React, { useState, useEffect } from 'react';
import { 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    FileText, 
    Plus, 
    Send, 
    ShieldCheck, 
    History,
    LayoutGrid,
    AlertTriangle,
    Wrench,
    Sparkles,
    Shield,
    Zap,
    MoreVertical
} from 'lucide-react';
import { createComplaint, getComplaintsByStudent } from '../services/complaintsService';
import { CATEGORY_LABEL, PRIORITY_LABEL } from '../data/complaintData';
import StudentNavbar from '../components/studentDashboard/StudentNavbar';

function Complaints() {
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [category, setCategory] = useState('maintenance');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [studentName, setStudentName] = useState(null);
    const [roomNumber, setRoomNumber] = useState(null);
    const [profile, setProfile] = useState(null);

    // Get student info from localStorage
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                setProfile(userData);
                setStudentId(userData._id || userData.id);
                setStudentName(userData.name || (userData.firstName + ' ' + userData.lastName));
                setRoomNumber(userData.roomNumber || userData.room);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    const fetchComplaints = async () => {
        try {
            if (!studentId) return;
            setLoading(true);
            const response = await getComplaintsByStudent(studentId);
            const complaintsList = response.data || response;
            setComplaints(complaintsList);
            if (complaintsList.length > 0) {
                setSelectedComplaint(complaintsList[0]);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching complaints:', err.message);
            setError(err.message);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) {
            fetchComplaints();
        }
    }, [studentId]);

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status?.toLowerCase() === 'pending').length,
        inProgress: complaints.filter(c => c.status?.toLowerCase() === 'in_progress').length,
        resolved: complaints.filter(c => c.status?.toLowerCase() === 'resolved').length,
    };

    const submitForm = async (e) => {
        e.preventDefault();
        if (!title || !description) {
            setError('All fields are mandatory for incident documentation.');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            setSuccessMsg(null);
            
            const payload = {
                studentId: studentId,
                studentName: studentName || 'Unknown',
                roomNumber: roomNumber || 'N/A',
                title,
                description,
                category,
                priority
            };

            const response = await createComplaint(payload);
            const newComplaint = response.data || response;
            setComplaints([newComplaint, ...complaints]);
            setSelectedComplaint(newComplaint);
            setTitle('');
            setDescription('');
            setCategory('maintenance');
            setPriority('medium');
            setSuccessMsg('Directive Submitted Successfully');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError('Failed to broadcast complaint. Verify network integrity.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0c10] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            <StudentNavbar profile={profile} />
            
            <div className="flex-1 p-6 lg:p-10 custom-scrollbar overflow-y-auto w-full">
                <div className="max-w-[1600px] mx-auto w-full space-y-10 animate-fade-in">
                    
                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Internal Support Matrix</p>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-4">
                                <AlertCircle className="text-indigo-500 w-10 h-10 md:w-12 md:h-12" />
                                Complaints Center
                            </h1>
                            <p className="text-slate-500 font-medium mt-3 tracking-wide">Report structural anomalies or service interruptions directly to administration.</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-900 shadow-2xl p-2 rounded-2xl border border-slate-800">
                             <div className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Response Time</span>
                                <span className="text-xs font-bold text-white flex items-center gap-1.5"><Clock size={14} /> Avg. 12 Hours</span>
                            </div>
                        </div>
                    </header>

                    {/* Stats Ribbon */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <CompactStat title="Total Directives" value={stats.total} icon={FileText} color="indigo" />
                        <CompactStat title="Awaiting Review" value={stats.pending} icon={Clock} color="amber" />
                        <CompactStat title="Active Repair" value={stats.inProgress} icon={Zap} color="sky" />
                        <CompactStat title="Resolved Cases" value={stats.resolved} icon={CheckCircle2} color="emerald" />
                    </div>

                    {/* Main Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        
                        {/* Left Wing: Form & History */}
                        <div className="xl:col-span-12 2xl:col-span-8 flex flex-col gap-10">
                            {/* Submission Form */}
                            <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none transition-opacity group-focus-within:opacity-100 opacity-50"></div>
                                
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                        <Plus className="text-indigo-400 w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white tracking-tight uppercase text-xs tracking-widest">New Incident Broadcast</h2>
                                </div>

                                <form onSubmit={submitForm} className="space-y-8 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Issue Subject</label>
                                            <input
                                                type="text"
                                                placeholder="Briefly summarize the anomaly..."
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:bg-slate-950 transition-all font-sans"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Classification</label>
                                            <select
                                                value={category}
                                                onChange={e => setCategory(e.target.value)}
                                                className="w-full appearance-none bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                                            >
                                                <option value="maintenance">Maintenance</option>
                                                <option value="cleaning">Cleaning</option>
                                                <option value="security">Security</option>
                                                <option value="utilities">Utilities</option>
                                                <option value="general">General</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Priority Factor</label>
                                            <select
                                                value={priority}
                                                onChange={e => setPriority(e.target.value)}
                                                className="w-full appearance-none bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                                            >
                                                <option value="low">Low Impact</option>
                                                <option value="medium">Medium Priority</option>
                                                <option value="high">High Necessity</option>
                                                <option value="urgent">Critical/Urgent</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Origin (Room)</label>
                                            <div className="w-full bg-slate-950/20 border border-slate-800/50 rounded-2xl px-6 py-4 text-sm font-black text-indigo-400/60 cursor-not-allowed">
                                                {roomNumber || 'A-204'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Evidence / Detailed Log</label>
                                        <textarea
                                            rows={5}
                                            placeholder="Provide technical details, location coordinates, or time of occurrence..."
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl px-6 py-5 text-sm font-medium text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:bg-slate-950 transition-all resize-none shadow-inner"
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-xs font-bold text-rose-400 animate-fade-in flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                            {error}
                                        </div>
                                    )}

                                    {successMsg && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-xs font-bold text-emerald-400 animate-fade-in flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            {successMsg}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full group flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-8 py-5 text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {submitting ? 'Encrypting & Dispatching...' : 'Broadcast directive'}
                                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                </form>
                            </section>

                            {/* Reports History List */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3">
                                        <History className="text-indigo-400 w-5 h-5" />
                                        <h2 className="text-xl font-bold text-white tracking-tight">Personal Directive <span className="text-indigo-500">Log</span></h2>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none bg-slate-900 px-3 py-1 rounded-full border border-slate-800">{complaints.length} Records</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {loading ? (
                                         <div className="col-span-full py-10 text-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Hydrating Archives...</p>
                                        </div>
                                    ) : complaints.length === 0 ? (
                                        <div className="col-span-full py-16 text-center bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-800">
                                            <ShieldCheck size={40} className="text-slate-800 mx-auto mb-4" />
                                            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Zero anomalous activity detected.</p>
                                        </div>
                                    ) : complaints.map(c => (
                                        <div
                                            key={c._id}
                                            onClick={() => setSelectedComplaint(c)}
                                            className={`p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${
                                                selectedComplaint?._id === c._id 
                                                ? 'bg-indigo-500/10 border-indigo-500/30 shadow-2xl scale-[1.02]' 
                                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div 
                                                    className={`w-2 h-2 rounded-full transition-shadow ${
                                                        c.status?.toLowerCase() === 'resolved' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                                        c.status?.toLowerCase() === 'in_progress' ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]' :
                                                        'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                                    }`}
                                                ></div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors truncate mb-1 pr-4">{c.title}</h4>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">ID: {c._id?.substring(0, 8).toUpperCase()}</p>
                                            
                                            <div className="flex justify-between items-center mt-auto">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                                    c.status?.toLowerCase() === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    c.status?.toLowerCase() === 'in_progress' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                    {c.status}
                                                </span>
                                                <MoreVertical size={14} className="text-slate-700 group-hover:text-slate-400" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right Wing: Selected Detail - Float Sticky */}
                        <div className="xl:col-span-12 2xl:col-span-4 h-fit sticky top-24">
                           {selectedComplaint ? (
                                <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-4 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden animate-fade-in">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
                                    
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-2xl text-indigo-400 text-xs font-black uppercase tracking-widest">
                                            <Zap size={14} /> Full Dossier
                                        </div>
                                        <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${getPriorityStyle(selectedComplaint.priority)}`}>
                                            {selectedComplaint.priority}
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-black text-white leading-tight mb-2 pr-10">{selectedComplaint.title}</h2>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/50 pb-6 mb-8">
                                       <Clock size={12} /> Filed: {new Date(selectedComplaint.createdAt).toLocaleString()}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoPanel label="Category" value={CATEGORY_LABEL[selectedComplaint.category] || selectedComplaint.category} icon={LayoutGrid} />
                                            <InfoPanel label="Current Status" value={selectedComplaint.status} icon={Shield} />
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Technical Brief</label>
                                            <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-2xl text-sm font-medium text-slate-300 leading-relaxed shadow-inner italic">
                                                "{selectedComplaint.description}"
                                            </div>
                                        </div>

                                        {/* Status Progress - Modernized */}
                                        <div className="pt-6 border-t border-slate-800/50">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-6 text-center">Protocol Lifecycle</label>
                                            <div className="relative flex justify-between items-center px-4">
                                                <div className="absolute top-[15px] left-8 right-8 h-[2px] bg-slate-800 z-0"></div>
                                                <div className={`absolute top-[15px] left-8 h-[2px] bg-indigo-500 transition-all duration-700 z-0`} style={{width: getProgressWidth(selectedComplaint.status)}}></div>
                                                
                                                <ProgressNode label="Filed" active={true} />
                                                <ProgressNode label="Vetting" active={['in_progress', 'resolved'].includes(selectedComplaint.status?.toLowerCase())} />
                                                <ProgressNode label="Repairs" active={['in_progress', 'resolved'].includes(selectedComplaint.status?.toLowerCase())} />
                                                <ProgressNode label="Fixed" active={selectedComplaint.status?.toLowerCase() === 'resolved'} />
                                            </div>
                                        </div>

                                        {/* Response Notes */}
                                        {selectedComplaint.supportNotes ? (
                                            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl mt-10 relative group">
                                                <div className="flex items-center gap-3 mb-3 text-emerald-400">
                                                    <Wrench size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Maintenance Directive</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-200 leading-relaxed">
                                                    {selectedComplaint.supportNotes}
                                                </p>
                                                <Sparkles className="absolute -top-3 -right-3 text-emerald-400/30 w-10 h-10 group-hover:scale-125 transition-transform" />
                                            </div>
                                        ) : (
                                            <div className="p-8 border border-dashed border-slate-800 rounded-3xl mt-10 text-center">
                                                <Clock size={24} className="text-slate-800 mx-auto mb-3 animate-pulse" />
                                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">Awaiting Admin Intervention</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                           ) : (
                                <div className="h-[600px] flex flex-col items-center justify-center text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem] p-12">
                                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 mb-6">
                                        <LayoutGrid size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-600 mb-2">No Dossier Selected</h3>
                                    <p className="text-xs text-slate-700 font-bold uppercase tracking-widest">Select a record from your log to view technical specifications.</p>
                                </div>
                           )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #0a0c10; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b; 
                    border-radius: 10px;
                }
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

// ====== SUBCOMPONENTS ======

const CompactStat = ({ title, value, icon: Icon, color }) => {
    const colors = {
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-5 hover:border-slate-700 transition-colors shadow-xl">
            <div className={`p-4 rounded-2xl ${colors[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-white">{value}</h3>
            </div>
        </div>
    );
};

const InfoPanel = ({ label, value, icon: Icon }) => (
    <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center gap-3">
        <Icon size={14} className="text-indigo-500" />
        <div>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-xs font-black text-white">{value}</p>
        </div>
    </div>
);

const ProgressNode = ({ label, active }) => (
    <div className="relative z-10 flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
            active ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-900 border-slate-800 text-slate-700'
        }`}>
            {active ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>}
        </div>
        <p className={`mt-3 text-[8px] font-black uppercase tracking-widest ${active ? 'text-indigo-400' : 'text-slate-700'}`}>{label}</p>
    </div>
);

const getProgressWidth = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return '0%';
    if (s === 'in_progress') return '66%';
    if (s === 'resolved') return '100%';
    return '0%';
};

const getPriorityStyle = (priority) => {
    const p = priority?.toLowerCase();
    if (p === 'urgent') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (p === 'high') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (p === 'medium') return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
};

export default Complaints;
