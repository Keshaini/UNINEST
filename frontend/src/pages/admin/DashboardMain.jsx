import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, 
    Home, 
    AlertCircle, 
    ArrowUpRight, 
    ArrowDownRight, 
    TrendingUp, 
    CreditCard, 
    MessageSquare,
    ChevronRight
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
    LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

const DashboardMain = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        occupancyRate: 0,
        openComplaints: 0,
        totalRooms: 0
    });
    const [completionData, setCompletionData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data for graphs
    const bookingRateData = [
        { name: 'Jan', rate: 45 },
        { name: 'Feb', rate: 52 },
        { name: 'Mar', rate: 48 },
        { name: 'Apr', rate: 61 },
        { name: 'May', rate: 55 },
        { name: 'Jun', rate: 67 },
        { name: 'Jul', rate: 75 },
    ];

    const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const baseUrl = 'http://localhost:5000/api';

                const [resStudents, resRooms, resComplaints] = await Promise.all([
                    axios.get(`${baseUrl}/students`, config).catch(() => ({ data: [] })),
                    axios.get(`${baseUrl}/rooms`, config).catch(() => ({ data: [] })),
                    axios.get(`${baseUrl}/complaints`, config).catch(() => ({ data: [] }))
                ]);

                const students = resStudents.data || [];
                const rooms = resRooms.data || [];
                const complaints = resComplaints.data || [];

                // 1. Process Stats
                const totalStudents = students.length;
                let totalCapacity = 0;
                let occupiedBeds = 0;
                rooms.forEach(room => {
                    totalCapacity += room.capacity || 2;
                    occupiedBeds += room.occupiedBeds || (room.occupants ? room.occupants.length : 0);
                });
                const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;
                const openComplaintsCount = complaints.filter(c => c.status !== 'Resolved').length;

                setStats({
                    totalStudents,
                    occupancyRate,
                    openComplaints: openComplaintsCount,
                    totalRooms: rooms.length
                });

                // 2. Process Completion Data (for Pie Chart)
                const completionCategories = [
                    { name: '0-25%', value: 0 },
                    { name: '26-50%', value: 0 },
                    { name: '51-75%', value: 0 },
                    { name: '76-100%', value: 0 }
                ];

                students.forEach(student => {
                    const comp = student.profileCompletion || 0;
                    if (comp <= 25) completionCategories[0].value++;
                    else if (comp <= 50) completionCategories[1].value++;
                    else if (comp <= 75) completionCategories[2].value++;
                    else completionCategories[3].value++;
                });

                // Remove zero-value segments
                setCompletionData(completionCategories.filter(c => c.value > 0));
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 w-16 h-16 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Dashboard Overview
                    </h1>
                    <p className="text-slate-400 font-medium">Insights and summary of system activities.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
                        <CalendarIcon className="w-4 h-4 text-indigo-400" />
                        <span className="font-semibold text-slate-300">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </header>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Students" 
                    value={stats.totalStudents} 
                    icon={Users} 
                    trend="+2.4%" 
                    isUp={true} 
                    color="indigo" 
                />
                <StatCard 
                    title="Occupancy" 
                    value={`${stats.occupancyRate}%`} 
                    icon={Home} 
                    trend="Stable" 
                    isUp={null} 
                    color="emerald" 
                />
                <StatCard 
                    title="Active Complaints" 
                    value={stats.openComplaints} 
                    icon={AlertCircle} 
                    trend="-12%" 
                    isUp={true} 
                    color="rose" 
                />
                <StatCard 
                    title="Estimated Revenue" 
                    value="LKR 1.2M" 
                    icon={TrendingUp} 
                    trend="+8.1%" 
                    isUp={true} 
                    color="amber" 
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Rate (Line/Area Chart) */}
                <div className="lg:col-span-2 bg-[#1E293B]/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white">Booking Rate Trend</h3>
                            <p className="text-sm text-slate-400">Monthly bed occupancy growth</p>
                        </div>
                        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={bookingRateData}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#0F172A', 
                                        borderColor: '#334155', 
                                        borderRadius: '12px',
                                        color: '#F8FAF6'
                                    }} 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="rate" 
                                    stroke="#818CF8" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRate)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profile Completion (Pie Chart) */}
                <div className="bg-[#1E293B]/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-white">Profile Readiness</h3>
                        <p className="text-sm text-slate-400">Student data completion levels</p>
                    </div>
                    <div className="h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={completionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {completionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-white">{stats.totalStudents}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {completionData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/40">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-xs font-semibold text-slate-300">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section - Mock Data Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity/Payment (Mock) */}
                <div className="bg-[#1E293B]/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                <CreditCard size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Payment Summary</h3>
                        </div>
                        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1 transition-colors">
                            Transactions <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-700/50">
                        {mockPayments.map(payment => (
                            <div key={payment.id} className="p-4 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${payment.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {payment.student[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-100">{payment.student}</p>
                                        <p className="text-[11px] text-slate-500 font-medium">{payment.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">LKR {payment.amount}</p>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${payment.status === 'Verified' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {payment.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Complaints Overview (Mock) */}
                <div className="bg-[#1E293B]/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                                <MessageSquare size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Urgent Complaints</h3>
                        </div>
                        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1 transition-colors">
                            Manage All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {mockComplaints.map(item => (
                            <div key={item.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 group hover:border-slate-600 transition-all cursor-default">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-200 text-sm group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{item.title}</h4>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-500 uppercase">{item.priority}</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1 mb-3">{item.message}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-400 font-bold tracking-widest px-2 py-1 bg-slate-800 rounded-lg uppercase">{item.roomNumber}</span>
                                    <span className="text-[10px] text-slate-600 font-medium italic">{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, trend, isUp, color }) => {
    const colorVariants = {
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };

    return (
        <div className="bg-[#1E293B]/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
            <div className="flex justify-between items-center mb-6">
                <div className={`p-3 rounded-2xl border ${colorVariants[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend !== 'Stable' && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isUp ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'}`}>
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </div>
                )}
                {trend === 'Stable' && (
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                        {trend}
                    </div>
                )}
            </div>
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
            <div className="text-3xl font-black text-white tracking-tight">{value}</div>
        </div>
    );
};

const CalendarIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

// Mocks
const mockPayments = [
    { id: 1, student: 'Dilumi Perera', amount: '25,000', date: '2 mins ago', status: 'Pending' },
    { id: 2, student: 'Kasun Bandara', amount: '18,500', date: '1 hour ago', status: 'Verified' },
    { id: 3, student: 'Nimasha Silva', amount: '22,000', date: '4 hours ago', status: 'Verified' },
];

const mockComplaints = [
    { id: 1, title: 'Water Leakage', priority: 'High', roomNumber: 'B-204', message: 'Main tap in washroom leaking badly.', time: '10 mins ago' },
    { id: 2, title: 'Fan Not Working', priority: 'Medium', roomNumber: 'A-105', message: 'Regulator not responding, fan stuck at speed 1.', time: '2 hours ago' },
];

export default DashboardMain;

