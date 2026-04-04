import React from 'react';
import { Home, Bookmark, IndianRupee, AlertCircle } from 'lucide-react';

const StudentSummaryCards = ({ roomData, payments, complaints }) => {
    const isAssigned = roomData?.assigned && roomData?.status !== 'Rejected';
    const roomStatus = isAssigned ? 'Allocated' : 'Not Assigned';
    const roomColor = isAssigned ? 'text-green-500' : 'text-slate-500';
    const roomBg = isAssigned ? 'bg-green-500/10' : 'bg-slate-500/10';
    const roomBorder = isAssigned ? 'border-green-500/30' : 'border-slate-500/30';

    const bookingStatus = roomData?.status || 'Pending';
    let bookingColor = 'text-yellow-500';
    let bookingBg = 'bg-yellow-500/10';
    let bookingBorder = 'border-yellow-500/30';
    
    if (bookingStatus === 'Allocated' || bookingStatus === 'Active') {
        bookingColor = 'text-green-500'; bookingBg = 'bg-green-500/10'; bookingBorder = 'border-green-500/30';
    } else if (bookingStatus === 'Rejected' || bookingStatus === 'Vacated') {
        bookingColor = 'text-red-500'; bookingBg = 'bg-red-500/10'; bookingBorder = 'border-red-500/30';
    }

    const totalFees = payments ? payments.reduce((sum, p) => sum + p.amount, 0) : 0;
    const openComplaintsCount = complaints ? complaints.filter(c => c.status !== 'Resolved').length : 0;

    const cards = [
        {
            title: 'My Room Status',
            value: roomStatus,
            icon: Home,
            color: roomColor, bgColor: roomBg, borderColor: roomBorder
        },
        {
            title: 'Booking Status',
            value: bookingStatus,
            icon: Bookmark,
            color: bookingColor, bgColor: bookingBg, borderColor: bookingBorder
        },
        {
            title: 'Total Fees (LKR)',
            value: `Rs. ${totalFees.toLocaleString()}`,
            icon: IndianRupee,
            color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30'
        },
        {
            title: 'Active Complaints',
            value: openComplaintsCount,
            icon: AlertCircle,
            color: openComplaintsCount > 0 ? 'text-orange-500' : 'text-slate-500', 
            bgColor: openComplaintsCount > 0 ? 'bg-orange-500/10' : 'bg-slate-500/10', 
            borderColor: openComplaintsCount > 0 ? 'border-orange-500/30' : 'border-slate-500/30'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => (
                <div key={index} className={`bg-slate-900 border-l-4 ${card.borderColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 font-medium text-sm">{card.title}</h3>
                        <div className={`p-2 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{card.value}</h2>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default StudentSummaryCards;
