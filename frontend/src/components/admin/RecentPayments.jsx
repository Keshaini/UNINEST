import React from 'react';

const RecentPayments = ({ payments }) => {
    return (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] h-full flex flex-col">
            <div className="p-6 border-b border-[#1e293b] flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-100">Recent Payments</h2>
                <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">View All</button>
            </div>
            
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="text-slate-400 text-xs uppercase tracking-wider border-b border-[#1e293b]">
                        <tr>
                            <th className="px-6 py-4 font-medium">Student Name</th>
                            <th className="px-6 py-4 font-medium">Room</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Amount</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b] text-sm">
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                    No recent payments found.
                                </td>
                            </tr>
                        ) : payments.map((payment, index) => (
                            <tr key={payment._id || index} className="hover:bg-[#1e293b]/40 transition-colors">
                                <td className="px-6 py-4 text-slate-200 font-medium">
                                    {payment.studentId?.user?.name || payment.studentName || 'Unknown User'}
                                </td>
                                <td className="px-6 py-4 text-slate-400">{payment.roomNumber || 'N/A'}</td>
                                <td className="px-6 py-4 text-slate-400">
                                    {new Date(payment.createdAt || payment.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-slate-200 font-medium tracking-wide">
                                    ₹{payment.amount}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        payment.status === 'Completed' || payment.status === 'Paid'
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : payment.status === 'Overdue'
                                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                    }`}>
                                        {payment.status || 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentPayments;
