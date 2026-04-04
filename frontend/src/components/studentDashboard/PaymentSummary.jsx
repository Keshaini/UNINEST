import React from 'react';
import { DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const PaymentSummary = ({ payments }) => {
    if (!payments) return <div className="animate-pulse bg-slate-800/50 rounded-xl h-48 w-full"></div>;

    const totalFees = payments.reduce((acc, curr) => acc + curr.amount, 0);
    const paidAmount = payments.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
    const remainingBalance = totalFees - paidAmount;

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 z-10 relative">
                <DollarSign className="text-blue-400" /> Payment Summary <span className="text-sm font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md ml-auto">LKR</span>
            </h2>
            
            <div className="space-y-4 z-10 relative flex-1">
                <div className="flex justify-between items-center bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 transition-all hover:bg-slate-800/60">
                    <span className="text-slate-300 font-semibold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Total Fees</span>
                    <span className="text-white font-bold text-lg tracking-wide">Rs. {totalFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 transition-all hover:bg-emerald-500/20">
                    <span className="text-emerald-400 font-semibold flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Paid Amount</span>
                    <span className="text-emerald-400 font-bold text-lg tracking-wide">Rs. {paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 transition-all hover:bg-rose-500/20">
                    <span className="text-rose-400 font-semibold flex items-center gap-2"><Clock className="w-4 h-4"/> Remaining Due</span>
                    <span className="text-rose-400 font-bold text-lg tracking-wide">Rs. {remainingBalance.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};
export default PaymentSummary;
