import React from 'react';
import { Bell, Calendar, ChevronRight } from 'lucide-react';

const NoticeList = ({ notices }) => {
    if (!notices) return <div className="animate-pulse bg-slate-800/50 rounded-xl h-64 w-full"></div>;

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-xl p-6 shadow-xl h-full flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Bell className="text-amber-400" /> Notice Board</h2>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {notices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 pt-8 pb-4">
                        <Bell className="w-12 h-12 mb-3 text-slate-700/50" />
                        <p className="font-medium text-sm">No recent notices.</p>
                        <p className="text-xs mt-1">You are all caught up.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                    {notices.slice(0, 5).map((notice) => (
                        <div key={notice._id} className="relative pl-6 border-l-2 border-indigo-500/30 pb-1 last:border-transparent group">
                            <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1 shadow-[0_0_10px_rgba(99,102,241,0.8)] group-hover:scale-125 transition-transform"></div>
                            <h4 className="font-bold text-slate-100 text-sm mb-1.5 group-hover:text-indigo-300 transition-colors leading-tight">{notice.title}</h4>
                            <p className="text-xs text-slate-400 mb-2.5 line-clamp-2 leading-relaxed">{notice.content}</p>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400/80 flex items-center gap-1.5 bg-indigo-900/20 inline-flex px-2 py-0.5 rounded-md border border-indigo-500/10">
                                <Calendar className="w-3 h-3"/> {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    ))}
                    </div>
                )}
            </div>
            
            {notices.length > 5 && (
                <button className="w-full mt-5 text-sm font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1 pt-3 border-t border-slate-800/60 hover:gap-2 transition-all">
                    All Announcements <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
export default NoticeList;
