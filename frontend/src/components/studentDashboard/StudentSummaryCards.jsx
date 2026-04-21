import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Bookmark, AlertCircle, ArrowUpRight } from 'lucide-react';

const StudentSummaryCards = ({ roomData, complaints }) => {
    const navigate = useNavigate();
    const isAssigned = roomData?.assigned && roomData?.status !== 'Rejected';
    const roomStatus = isAssigned ? 'Allocated' : 'Not Assigned';
    const roomColor = isAssigned ? 'text-green-600' : 'text-slate-500';
    const roomBg = isAssigned ? 'bg-green-50' : 'bg-slate-50';
    const roomBorder = isAssigned ? 'border-green-100' : 'border-slate-100';

    const bookingStatus = roomData?.status || 'Pending';
    let bookingColor = 'text-amber-600';
    let bookingBg = 'bg-amber-50';
    let bookingBorder = 'border-amber-100';
    
    if (bookingStatus === 'Allocated' || bookingStatus === 'Active') {
        bookingColor = 'text-green-400'; bookingBg = 'bg-green-500/10'; bookingBorder = 'border-green-500/30';
    } else if (bookingStatus === 'Rejected' || bookingStatus === 'Vacated') {
        bookingColor = 'text-red-400'; bookingBg = 'bg-red-500/10'; bookingBorder = 'border-red-500/30';
    }

    const openComplaintsCount = complaints ? complaints.filter(c => c.status !== 'Resolved').length : 0;

    const cards = [
        {
            title: 'My Room Status',
            value: roomStatus,
            icon: Home,
            color: roomColor, bgColor: roomBg, borderColor: roomBorder,
            link: '/rooms'
        },
        {
            title: 'Booking Status',
            value: bookingStatus,
            icon: Bookmark,
            color: bookingColor, bgColor: bookingBg, borderColor: bookingBorder,
            link: '/rooms'
        },
        {
            title: 'Active Complaints',
            value: openComplaintsCount,
            icon: AlertCircle,
            color: openComplaintsCount > 0 ? 'text-orange-600' : 'text-slate-500', 
            bgColor: openComplaintsCount > 0 ? 'bg-orange-50' : 'bg-slate-50', 
            borderColor: openComplaintsCount > 0 ? 'border-orange-100' : 'border-slate-100',
            link: '/complaints/student'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {cards.map((card, index) => (
                <div 
                    key={index} 
                    onClick={() => navigate(card.link)}
                    className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 group hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={16} className="text-indigo-400" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">{card.title}</h3>
                        <div className={`p-3 rounded-2xl ${card.bgColor} ${card.color} transition-transform duration-500 group-hover:scale-110`}>
                            <card.icon size={20} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tighter">{card.value}</h2>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest group-hover:underline">View details</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default StudentSummaryCards;
