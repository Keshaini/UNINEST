import React from 'react';
import { Link } from 'react-router-dom';
import { Building, ShieldCheck, Clock, Home as HomeIcon } from 'lucide-react';
import logo from '../assets/logo.png';

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-white">
            {/* Navbar */}
            <nav className="h-20 bg-white flex items-center justify-between px-6 md:px-12 shadow-sm z-50 relative shrink-0">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Logo" className="w-8 h-8 object-contain rounded" />
                    <span className="text-xl font-bold text-slate-800 tracking-tight">HostelPro</span>
                </div>
                <div className="flex items-center gap-6 md:gap-8 text-sm font-semibold">
                    <Link to="/" className="hidden sm:flex items-center gap-1.5 text-slate-600 hover:text-[#0b82a3] transition-colors">
                        <HomeIcon className="w-4 h-4" /> Home
                    </Link>
                    <Link to="/login" className="text-slate-600 hover:text-[#0b82a3] transition-colors">Login</Link>
                    <Link to="/signup" className="bg-[#12688f] hover:bg-[#0e5170] text-white px-6 py-2.5 rounded-lg transition-all shadow-sm active:scale-95">
                        Register
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 bg-gradient-to-br from-[#1aa3c9] to-[#127fa1] flex items-center relative overflow-hidden">
                <div className="max-w-7xl mx-auto w-full px-6 md:px-12 flex flex-col md:flex-row items-center justify-between py-12 md:py-0">
                    
                    {/* Left Content */}
                    <div className="md:w-[55%] text-left z-10 pt-10 md:pt-0">
                        <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                            Your Hostel, <span className="text-yellow-400 inline-block drop-shadow-sm mt-1 md:mt-2 lg:mt-3">Tracked<br/>& Managed</span>
                        </h1>
                        <p className="text-white/95 text-sm md:text-base lg:text-lg mb-10 max-w-lg leading-relaxed font-medium">
                            HostelPro helps you manage your accommodation records, track daily events, and connect with administration - all in one place.
                        </p>
                        <div className="flex items-center gap-4 pb-12 md:pb-0">
                            <Link to="/signup" className="bg-slate-100 hover:bg-white text-[#1aa3c9] px-7 py-3.5 rounded-xl font-extrabold shadow-lg shadow-black/10 transition-all active:scale-95 text-sm sm:text-base">
                                Get Started
                            </Link>
                            <Link to="/login" className="bg-transparent hover:bg-white/10 text-white border-[2.5px] border-white px-10 py-3.5 rounded-xl font-bold transition-all active:scale-95 text-sm sm:text-base">
                                Login
                            </Link>
                        </div>
                    </div>

                    {/* Right Graphic - Prominent Logo Display */}
                    <div className="hidden md:flex md:w-[45%] justify-center items-center relative z-10 w-full pl-10 lg:pl-0">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150"></div>
                            <img 
                                src={logo} 
                                alt="HostelPro Prominent Logo" 
                                className="w-64 lg:w-80 h-auto relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] transform hover:scale-105 transition-transform duration-500 object-contain"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Background decorative faint waves/circles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-40 -right-20 w-[30rem] h-[30rem] rounded-full bg-white opacity-5 blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-20 w-[40rem] h-[40rem] rounded-full bg-indigo-900 opacity-[0.03] blur-3xl"></div>
                </div>
            </main>

            {/* Bottom Section */}
            <section className="bg-slate-100 pt-16 pb-20 text-center relative z-20">
                <h2 className="text-[1.8rem] md:text-[2rem] font-extrabold text-slate-800 mb-2 tracking-tight">Why Choose HostelPro?</h2>
                <p className="text-slate-500 font-medium tracking-wide text-sm md:text-base">Comprehensive hostel management at your fingertips</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mt-12 px-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Building className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">Room Management</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Easily browse, select and manage your room allocations seamlessly.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">Smart Safety</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Real-time attendance, complaints logging and secure profile validation.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">Instant Operations</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Manage payments, get instant notices and process leave requests 24/7.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
