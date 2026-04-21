import React from 'react';

const BookingStatusBadge = ({ status }) => {
    let colorClass = "bg-slate-500/20 text-slate-400 border-slate-500/30";
    
    if (status === 'Active' || status === 'Allocated') {
        colorClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    } else if (status === 'Pending') {
        colorClass = "bg-amber-500/20 text-amber-400 border-amber-500/30";
    } else if (status === 'Rejected' || status === 'Vacated') {
        colorClass = "bg-rose-500/20 text-rose-400 border-rose-500/30";
    }

    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${colorClass}`}>
            {status}
        </span>
    );
};
export default BookingStatusBadge;
