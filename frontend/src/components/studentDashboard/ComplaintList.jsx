import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const ComplaintList = ({ complaints }) => {
    if (!complaints) return <div className="animate-pulse bg-slate-800/50 rounded-xl h-64 w-full"></div>;

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-xl p-6 shadow-xl h-full flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><AlertCircle className="text-rose-400" /> Recent Complaints</h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {complaints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 pt-8 pb-4">
                        <CheckCircle className="w-12 h-12 mb-3 text-emerald-500/30" />
                        <p className="font-medium text-sm">No complaints logged.</p>
                        <p className="text-xs mt-1">Everything looks good!</p>
                    </div>
                ) : (
                    complaints.slice(0, 5).map((complaint) => {
                        let icon = <Clock className="w-3.5 h-3.5"/>;
                        let bgClass = "bg-amber-500/10 border-amber-500/20 text-amber-500";
                        if (complaint.status === 'Resolved') {
                            icon = <CheckCircle className="w-3.5 h-3.5"/>;
                            bgClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                        } else if (complaint.status === 'Rejected') {
                            icon = <AlertCircle className="w-3.5 h-3.5"/>;
                            bgClass = "bg-rose-500/10 border-rose-500/20 text-rose-500";
                        } else if (complaint.status === 'In Progress') {
                            icon = <Clock className="w-3.5 h-3.5 animate-pulse"/>;
                            bgClass = "bg-blue-500/10 border-blue-500/20 text-blue-400";
                        }

                        return (
                            <div key={complaint._id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/70 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-indigo-300 transition-colors">{complaint.title}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase flex items-center gap-1 shadow-sm ${bgClass}`}>
                                        {icon} {complaint.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{complaint.description}</p>
                            </div>
                        )
                    })
                )}
            </div>
            {complaints.length > 5 && (
                <button className="w-full mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-semibold py-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-all border border-slate-700/50 shadow-sm active:scale-95">
                    View All Tracking &rarr;
                </button>
            )}
        </div>
    );
};
export default ComplaintList;
