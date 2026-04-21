import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    LayoutDashboard, 
    Home, 
    MessageSquare, 
    Bell, 
    CreditCard, 
    Activity,
    TrendingUp,
    PieChart as PieChartIcon,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Users,
    MapPin,
    ShieldCheck
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import StudentNavbar from '../components/studentDashboard/StudentNavbar';

// ====== MOCK DATA ======
const MOCK_COMPLAINTS_STATS = [
    { name: 'Resolved', value: 12, color: '#10b981' },
    { name: 'Pending', value: 5, color: '#f59e0b' },
    { name: 'Processing', value: 3, color: '#3b82f6' }
];

const MOCK_PAYMENT_HISTORY = [
    { month: 'Jan', amount: 12000 },
    { month: 'Feb', amount: 15000 },
    { month: 'Mar', amount: 12000 },
    { month: 'Apr', amount: 18000 },
    { month: 'May', amount: 20000 },
    { month: 'Jun', amount: 15000 },
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function StudentDashboard() {
    const [profile, setProfile] = useState(null);
    const [roomData, setRoomData] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const [profileRes, roomRes, compRes, noticeRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/students/profile', config).catch(() => ({data: null})),
                    axios.get('http://localhost:5000/api/students/room', config).catch(() => ({data: null})),
                    axios.get('http://localhost:5000/api/students/complaints', config).catch(() => ({data: []})),
                    axios.get('http://localhost:5000/api/notices', config).catch(() => ({data: []}))
                ]);

                setProfile(profileRes.data);
                setRoomData(roomRes.data);
                setComplaints(compRes.data);
                setNotices(noticeRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0c10]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-x-0 -bottom-8 text-indigo-400 text-xs font-black tracking-widest text-center uppercase">Loading Ecosystem</div>
                </div>
            </div>
        );
    }

    const isRoomAssigned = roomData?.assigned && roomData?.status !== 'Rejected';

    return (
        <div className="flex flex-col min-h-screen bg-[#0a0c10] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            <StudentNavbar profile={profile} />
            
            <div className="flex-1 p-6 lg:p-10 custom-scrollbar overflow-y-auto w-full">
                <div className="max-w-[1600px] mx-auto w-full space-y-10">
                    
                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
                                <LayoutDashboard className="text-indigo-500 w-10 h-10" />
                                Student Hub
                            </h1>
                            <p className="text-slate-500 font-medium tracking-wide">Welcome back, <span className="text-indigo-400">{profile?.firstName || 'Student'}</span>. Here's your automated residency overview.</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
                            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">System Status</span>
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5"><ShieldCheck size={14} /> Encrypted & Active</span>
                            </div>
                            <div className="px-4 py-2 border border-slate-800 rounded-xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Last Login</span>
                                <span className="text-xs font-bold text-white uppercase">{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </header>

                    {/* Top Stats - Live & Mock Mix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Room Allocation" 
                            value={isRoomAssigned ? roomData.roomId?.roomNumber || 'A-204' : 'Pending'} 
                            subtitle={isRoomAssigned ? 'Assigned' : 'Awaiting admin action'}
                            icon={Home}
                            color="indigo"
                            isLive
                        />
                         <StatCard 
                            title="Account Balance" 
                            value="LKR 12,450" 
                            subtitle="Overdue by 5 days"
                            icon={CreditCard}
                            color="rose"
                            trend="down"
                        />
                        <StatCard 
                            title="Open Tickets" 
                            value={complaints.filter(c => c.status !== 'Resolved').length} 
                            subtitle="2 pending response"
                            icon={MessageSquare}
                            color="amber"
                            isLive
                        />
                        <StatCard 
                            title="Attendance" 
                            value="94%" 
                            subtitle="Academic Year 2024"
                            icon={Activity}
                            color="emerald"
                            trend="up"
                        />
                    </div>

                    {/* Middle Section - Analytics & Profile */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Interactive Analytics */}
                        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                           
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <TrendingUp className="text-indigo-400" /> Utility Usage & Payments
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium">Monthly expenditure analysis (LKR)</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg">6 Months</button>
                                    <button className="px-3 py-1 bg-slate-800 text-slate-500 text-[10px] font-black uppercase rounded-lg hover:text-white transition-colors">1 Year</button>
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={MOCK_PAYMENT_HISTORY}>
                                        <defs>
                                            <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 700}} dy={10} />
                                        <YAxis hide />
                                        <Tooltip 
                                            contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}}
                                            itemStyle={{color: '#818cf8'}}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Profile Summary - Live Data */}
                        <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md flex flex-col items-center">
                            <h2 className="text-xl font-bold text-white mb-8 self-start flex items-center gap-2">
                                <Users className="text-indigo-400" /> Identity
                            </h2>
                            <div className="relative mb-6">
                                <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                                    {profile?.profilePic ? (
                                        <img src={profile.profilePic} className="w-full h-full object-cover rounded-[2rem]" alt="Profile" />
                                    ) : (
                                        <span className="text-3xl font-black text-indigo-400 uppercase">{profile?.firstName?.[0]}{profile?.lastName?.[0]}</span>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-[#0a0c10] w-6 h-6 rounded-full"></div>
                            </div>
                            <h3 className="text-2xl font-black text-white text-center leading-tight">{profile?.firstName} {profile?.lastName}</h3>
                            <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mt-1">{profile?.registrationNumber}</p>
                            
                            <div className="w-full mt-8 space-y-4">
                                <ProfileDetail label="Course" value={profile?.course} icon={Calendar} />
                                <ProfileDetail label="Year" value={profile?.batchYear} icon={TrendingUp} />
                                <ProfileDetail label="Room" value={isRoomAssigned ? roomData.roomId?.roomNumber : 'N/A'} icon={MapPin} />
                            </div>
                            
                            <div className="mt-8 w-full">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profile Integrity</span>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase">{profile?.profileCompletion || 10}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                        style={{width: `${profile?.profileCompletion || 10}%`}}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section - More Charts & Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Complaints Distribution - Pie Chart */}
                        <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
                            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <PieChartIcon className="text-indigo-400" /> Resolution Matrix
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">Complaint Management Ratio</p>
                            
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={MOCK_COMPLAINTS_STATS}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            stroke="none"
                                            innerRadius={40}
                                            paddingAngle={8}
                                        >
                                            {MOCK_COMPLAINTS_STATS.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'}}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <div className="flex justify-center gap-4 mt-2">
                                {MOCK_COMPLAINTS_STATS.map(item => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                                        <span className="text-[10px] font-bold text-slate-400 capitalize">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Notices - Live Data */}
                        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Bell className="text-indigo-400" /> Intelligence Feed
                                </h2>
                                <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline transition-all">View All Intelligence</button>
                            </div>
                            
                            <div className="space-y-4">
                                {notices.length > 0 ? notices.slice(0, 3).map((notice, i) => (
                                    <NoticeItem key={notice._id || i} title={notice.title} date={notice.createdAt} category={notice.priority} />
                                )) : (
                                    <div className="py-20 text-center">
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active intelligence detected.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #0a0c10; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b; 
                    border-radius: 10px;
                }
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

// ====== SUBCOMPONENTS ======

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, isLive }) => {
    const colors = {
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colors[color]} transition-transform group-hover:scale-110`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span className="text-[10px] font-black tracking-widest">12%</span>
                    </div>
                )}
                {isLive && (
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live</span>
                    </div>
                )}
            </div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</h3>
            <p className="text-2xl font-black text-white leading-none mb-1 tracking-tight">{value}</p>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
    );
};

const ProfileDetail = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between p-3 bg-slate-800/20 border border-slate-800/40 rounded-xl">
        <div className="flex items-center gap-3">
            <Icon size={14} className="text-indigo-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-sm font-bold text-white">{value || 'N/A'}</span>
    </div>
);

const NoticeItem = ({ title, date, category }) => {
    const categories = {
        High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        Medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        Low: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    };

    return (
        <div className="flex items-center justify-between p-4 bg-slate-800/20 border border-slate-800/40 rounded-2xl hover:border-indigo-500/30 transition-all group pointer-events-none">
            <div className="flex items-center gap-4">
                <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${categories[category] || categories.Low}`}>
                    {category || 'Info'}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{new Date(date).toLocaleDateString()}</p>
                </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-700 group-hover:text-indigo-400 transition-all" />
        </div>
    );
};

export default StudentDashboard;
