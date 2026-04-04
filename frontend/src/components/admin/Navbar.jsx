import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Menu, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen, setActiveTab }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: 'Admin User', role: 'admin' });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const loadUserFromStorage = () => {
        const userStr = localStorage.getItem('adminUser');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    };

    useEffect(() => {
        loadUserFromStorage();
        // Listen for profile updates
        window.addEventListener('user-profile-updated', loadUserFromStorage);
        return () => {
            window.removeEventListener('user-profile-updated', loadUserFromStorage);
        };
    }, []);

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
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin-login');
    };

    return (
        <nav className="h-20 bg-[#0B1120]/90 backdrop-blur-xl border-b border-[#1e293b] flex items-center justify-between px-6 md:px-8 z-40 sticky top-0 shadow-sm">
            {/* Mobile Menu Toggle */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-[#1e293b] rounded-lg transition-all"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl hidden md:block ml-4 md:ml-0">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search students, rooms, payments..."
                        className="w-full bg-[#1e293b]/50 border border-[#1e293b] text-slate-200 text-sm rounded-full pl-12 pr-4 py-2.5 outline-none focus:border-indigo-500/50 focus:bg-[#1e293b] transition-all placeholder:text-slate-500 font-medium"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-5 ml-auto relative">
                <button className="relative p-2 rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-slate-900 shadow-sm"></span>
                </button>
                
                <div className="flex items-center space-x-4 pl-5 border-l border-slate-800 relative cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)} ref={dropdownRef}>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-100 tracking-wide">{user.name || 'Admin User'}</p>
                        <p className="text-xs text-indigo-400 font-medium uppercase tracking-widest">{user.role || 'Admin'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner overflow-hidden hover:ring-2 hover:ring-indigo-500/50 transition-all">
                        {user.profilePic ? (
                            <img src={`http://localhost:5000${user.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold">{user.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
                        )}
                    </div>
                    
                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-3 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-fade-in origin-top-right">
                            <div className="px-4 py-3 border-b border-slate-700/50 mb-1">
                                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email || 'Admin'}</p>
                            </div>
                            
                            <button 
                                onClick={() => { setActiveTab('Profile'); setIsDropdownOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 flex items-center gap-3 transition-colors"
                            >
                                <User className="w-4 h-4" /> View Profile
                            </button>
                            
                            <button 
                                onClick={() => { setActiveTab('Profile'); setIsDropdownOpen(false); }}
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

export default Navbar;
