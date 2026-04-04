import React from 'react';

const RecentComplaints = ({ complaints }) => {
    return (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] h-full flex flex-col">
            <div className="p-6 border-b border-[#1e293b] flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-100">Recent Complaints</h2>
                <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">View All</button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[400px]">
                {complaints.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No recent complaints found.
                    </div>
                ) : (
                    <ul className="divide-y divide-[#1e293b]">
                        {complaints.map((complaint, index) => (
                            <li key={complaint._id || index} className="p-6 hover:bg-[#1e293b]/40 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-md font-medium text-slate-200">
                                            {complaint.title || 'Complaint Title'}
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {complaint.studentId?.user?.name || complaint.studentName || 'Unknown'} - Room {complaint.roomNumber || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-xs font-semibold">
                                        <span className={`px-2 py-1 rounded-md bg-opacity-10 border ${
                                            complaint.priority?.toLowerCase() === 'urgent'
                                                ? 'bg-red-500 text-red-500 border-red-500/20'
                                                : complaint.priority?.toLowerCase() === 'high'
                                                ? 'bg-orange-500 text-orange-500 border-orange-500/20'
                                                : complaint.priority?.toLowerCase() === 'medium'
                                                ? 'bg-blue-500 text-blue-500 border-blue-500/20'
                                                : 'bg-green-500 text-green-500 border-green-500/20'
                                        }`}>
                                            {complaint.priority || 'Normal'}
                                        </span>
                                        <span className={`px-2 py-1 rounded-md bg-opacity-10 border ${
                                            complaint.status?.toLowerCase() === 'resolved'
                                                ? 'bg-green-500 text-green-500 border-green-500/20'
                                                : complaint.status?.toLowerCase() === 'in progress'
                                                ? 'bg-yellow-500 text-yellow-500 border-yellow-500/20'
                                                : 'bg-indigo-500 text-indigo-500 border-indigo-500/20'
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

export default RecentComplaints;
