import React from 'react';
import { Users, Building2, IndianRupee, AlertCircle } from 'lucide-react';

const DashboardCards = ({ stats }) => {
    const cards = [
        {
            title: 'Total Students',
            value: stats.totalStudents,
            status: '+2% this month',
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30'
        },
        {
            title: 'Occupancy Rate',
            value: `${stats.occupancyRate}%`,
            status: 'Stable',
            icon: Building2,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30'
        },
        {
            title: 'Revenue (Monthly)',
            value: `₹${stats.revenue.toLocaleString()}`,
            status: '+5% this month',
            icon: IndianRupee,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30'
        },
        {
            title: 'Open Complaints',
            value: stats.openComplaints,
            status: 'Needs attention',
            icon: AlertCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => (
                <div key={index} className={`bg-[#0f172a] border-t-[3px] ${card.borderColor} rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-lg transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 font-medium text-sm">{card.title}</h3>
                        <div className={`p-2 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-100">{card.value}</h2>
                        <p className={`text-xs mt-2 ${card.color}`}>{card.status}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardCards;
