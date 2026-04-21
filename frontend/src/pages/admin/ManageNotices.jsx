import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Megaphone, Users, AlertCircle, Clock, Calendar, Search, Filter, Loader2, Send } from 'lucide-react';

const ManageNotices = () => {
    const [notices, setNotices] = useState([]);
    const [form, setForm] = useState({ title: '', content: '', targetAudience: 'All', priority: 'Normal' });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/api/notices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(res.data);
        } catch (err) {
            toast.error('Failed to load official notices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('adminToken');
            await axios.post('http://localhost:5000/api/notices', form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Notice distributed successfully!');
            setForm({ title: '', content: '', targetAudience: 'All', priority: 'Normal' });
            fetchNotices();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to post notice');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in text-slate-200">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Official Notices</h2>
                    <p className="text-slate-400 mt-1">Broadcast announcements to students and staff across the hostel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Wing */}
                <div className="lg:col-span-12 xl:col-span-5 bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-focus-within:bg-indigo-500/10 transition-colors"></div>
                    
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <Megaphone className="text-indigo-400 w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Broadcast Transmitter</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Announcement Title</label>
                            <input 
                                type="text" 
                                value={form.title} 
                                onChange={e => setForm({ ...form, title: e.target.value })} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-slate-200 focus:border-indigo-500 outline-none transition-all font-medium" 
                                placeholder="E.g. Room Inspection Schedule" 
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Notice Content</label>
                            <textarea 
                                rows="4" 
                                value={form.content} 
                                onChange={e => setForm({ ...form, content: e.target.value })} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-slate-200 focus:border-indigo-500 outline-none transition-all font-medium resize-none shadow-inner" 
                                placeholder="Detail the announcement for the target audience..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Target Audience</label>
                                <select 
                                    value={form.targetAudience} 
                                    onChange={e => setForm({ ...form, targetAudience: e.target.value })} 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-slate-200 focus:border-indigo-500 outline-none transition-all font-medium appearance-none cursor-pointer"
                                >
                                    <option value="All">All Entities</option>
                                    <option value="Students">Only Students</option>
                                    <option value="Staff">Only Staff</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Notice Priority</label>
                                <select 
                                    value={form.priority} 
                                    onChange={e => setForm({ ...form, priority: e.target.value })} 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-slate-200 focus:border-indigo-500 outline-none transition-all font-medium appearance-none cursor-pointer"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Normal">Normal</option>
                                    <option value="High">High (Urgent)</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            {isSubmitting ? 'Distributing...' : 'Broadcast Notice'}
                        </button>
                    </form>
                </div>

                {/* History List Wing */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <div className="flex items-center justify-between px-2">
                         <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase text-xs tracking-[0.2em] text-slate-500 font-bold">
                            <Clock className="w-4 h-4" /> 
                            Recent Broadcast History
                         </h3>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="p-20 text-center bg-slate-900 border border-dashed border-slate-800 rounded-[32px]">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
                                <p className="text-xs font-bold text-slate-500 text-uppercase tracking-widest uppercase">Hydrating Notice Board...</p>
                            </div>
                        ) : notices.length === 0 ? (
                            <div className="p-20 text-center bg-slate-900 border border-dashed border-slate-800 rounded-[32px]">
                                <Megaphone className="w-8 h-8 text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-600 font-bold tracking-widest uppercase text-xs">No active broadcasts detected.</p>
                            </div>
                        ) : notices.map(notice => (
                            <div key={notice._id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-slate-700 transition-all shadow-xl group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${notice.priority === 'High' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-indigo-500'}`}></div>
                                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{notice.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                            notice.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}>
                                            {notice.priority}
                                        </span>
                                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
                                            {notice.targetAudience}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium mb-6 line-clamp-2 italic">"{notice.content}"</p>
                                <div className="flex items-center gap-6 pt-4 border-t border-slate-800/50">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Users className="w-3.5 h-3.5" />
                                        Active Notice
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageNotices;
