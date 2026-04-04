import React from 'react';
import { Bell } from 'lucide-react';

const StudentNotices = ({ notices }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full flex flex-col p-6">
            <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" /> Recent Notices
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4">
                {!notices || notices.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No recent notices found.</p>
                ) : (
                    notices.slice(0, 3).map((notice, i) => (
                        <div key={notice._id || i} className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-slate-200 text-sm">{notice.title}</h4>
                                <span className="text-[10px] text-indigo-400 font-medium bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                    {new Date(notice.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">{notice.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
export default StudentNotices;
