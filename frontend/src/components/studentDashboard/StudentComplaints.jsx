import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentComplaints = ({ complaints }) => {
    const navigate = useNavigate();
    
    return (
        <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/40 h-full flex flex-col group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Active Complaints</h2>
                <button 
                    onClick={() => navigate('/complaints')}
                    className="text-xs font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-widest transition-colors cursor-pointer border-b-2 border-transparent hover:border-indigo-600 pb-0.5"
                >
                    View All
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[400px]">
                {!complaints || complaints.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-bold italic">
                        No recent complaints found.
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-50">
                        {complaints.slice(0,5).map((complaint, index) => (
                            <li key={complaint._id || index} className="p-8 hover:bg-slate-50/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 pr-4">
                                        <h3 className="text-sm font-black text-slate-800">
                                            {complaint.title || 'Complaint Title'}
                                        </h3>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">
                                            {new Date(complaint.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            complaint.priority?.toLowerCase() === 'urgent'
                                                ? 'bg-red-50 text-red-500'
                                                : complaint.priority?.toLowerCase() === 'high'
                                                ? 'bg-orange-50 text-orange-600'
                                                : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {complaint.priority || 'Normal'}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            complaint.status?.toLowerCase() === 'resolved'
                                                ? 'bg-green-50 text-green-600'
                                                : complaint.status?.toLowerCase() === 'in progress'
                                                ? 'bg-amber-50 text-amber-600'
                                                : 'bg-indigo-50 text-indigo-600'
                                        }`}>
                                            {complaint.status || 'Open'}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
export default StudentComplaints;
