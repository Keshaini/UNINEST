import React from 'react';
import { LayoutDashboard, Users, DoorOpen, CreditCard, MessageSquare, LogOut, CheckSquare, Bell } from 'lucide-react';
import logo from '../../assets/logo.png';

const Sidebar = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin-login';
    };

    const navItems = [
        { id: 'Dashboard', icon: LayoutDashboard },
        { id: 'Students', icon: Users },
        { id: 'Rooms', icon: DoorOpen },
        { id: 'Payments', icon: CreditCard },
        { id: 'Complaints', icon: MessageSquare },
        { id: 'Allocations', icon: CheckSquare },
        { id: 'Notices', icon: Bell },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <aside className={`w-64 bg-[#0B1120] border-r border-[#1e293b] flex flex-col h-full fixed md:sticky top-0 z-50 transition-transform duration-300 ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
                <div className="flex flex-col items-center justify-center pt-8 pb-6 border-b border-[#1e293b] px-6 group cursor-pointer">
                    <img src={logo} alt="HostelPro Logo" className="h-16 w-16 object-contain mb-4 drop-shadow-[0_4px_12px_rgba(99,102,241,0.3)] transform transition-transform duration-300 group-hover:scale-105 mx-auto" />
                    <h2 className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-wide text-center transform transition-all duration-300 group-hover:scale-105">
                        HostelPro
                    </h2>
                    <p className="text-xs text-slate-400 font-medium tracking-wide mt-1 text-center">Management System</p>
                </div>
            
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 px-2">Main Menu</p>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            activeTab === item.id 
                            ? 'bg-[#1e293b] text-slate-200 font-semibold shadow-sm' 
                            : 'text-slate-400 hover:bg-[#1e293b]/50 hover:text-slate-300 font-medium'
                        }`}
                    >
                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-slate-200' : 'text-slate-400'}`} />
                        <span>{item.id}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800 mt-auto bg-slate-900/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300 font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
        </>
    );
};

export default Sidebar;
