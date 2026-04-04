import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const StudentNavbar = ({ profile }) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const studentName = profile?.firstName ? `${profile.firstName} ${profile.lastName}` : 'Student Name';
    const firstInitial = profile?.firstName?.[0] || 'S';

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-40 relative shadow-sm w-full shrink-0">
            <div className="flex items-center">
                <img src={logo} alt="HostelPro Logo" className="w-[45px] h-auto object-contain drop-shadow-[0_4px_12px_rgba(99,102,241,0.3)] mr-[10px]" />
                <h2 className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-wide hidden sm:block">
                    HostelPro
                </h2>
            </div>

            <div className="flex-1 max-w-xl mx-auto ml-4 sm:ml-6 hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search notices, payments..."
                        className="w-full bg-slate-800/40 border border-slate-700 text-slate-200 text-sm rounded-full pl-12 pr-4 py-2.5 outline-none focus:border-indigo-500/50 focus:bg-slate-800/80 transition-all placeholder:text-slate-500 font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-5 ml-auto relative">
                <button className="relative p-2 rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-slate-900 shadow-sm"></span>
                </button>
                
                <div className="flex items-center space-x-4 pl-5 border-l border-slate-800 relative cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)} ref={dropdownRef}>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-100 tracking-wide">{studentName}</p>
                        <p className="text-xs text-indigo-400 font-medium uppercase tracking-widest">STUDENT</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner overflow-hidden hover:ring-2 hover:ring-indigo-500/50 transition-all">
                        {profile?.profilePic ? (
                            <img src={profile.profilePic.startsWith('data:image') || profile.profilePic.startsWith('http') ? profile.profilePic : `http://localhost:5000${profile.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-lg">{firstInitial}</span>
                        )}
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-3 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-fade-in origin-top-right text-left">
                            <div className="px-4 py-3 border-b border-slate-700/50 mb-1">
                                <p className="text-sm font-semibold text-white truncate">{studentName}</p>
                                <p className="text-xs text-slate-400 truncate">{profile?.userId?.email || 'Student'}</p>
                            </div>
                            
                            <button 
                                onClick={() => { navigate('/student/profile'); setIsDropdownOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center gap-3 transition-colors"
                            >
                                <User className="w-4 h-4" /> View Profile
                            </button>
                            
                            <button 
                                onClick={() => { navigate('/student/profile?edit=true'); setIsDropdownOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center gap-3 transition-colors"
                            >
                                <Settings className="w-4 h-4" /> Edit Profile
                            </button>

                            <div className="h-px bg-slate-700/50 my-1"></div>

                            <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
export default StudentNavbar;
