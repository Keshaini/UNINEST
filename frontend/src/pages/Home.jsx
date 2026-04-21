import React from 'react';
import { Link } from 'react-router-dom';
import { Building, ShieldCheck, Clock, Phone, Mail, Home as HomeIcon, Twitter, Facebook, Instagram, ChevronDown, ArrowRight } from 'lucide-react';

const Home = () => {
    return (
        <div className="font-sans bg-white overflow-x-hidden">
            {/* Hero Section Container */}
            <div 
                className="relative min-h-screen bg-cover bg-center flex flex-col" 
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop')` }}
            >
                {/* Dark Overlay similar to image */}
                <div className="absolute inset-0 bg-[#0f1f2e]/75"></div>
                
                <div className="relative z-10 flex flex-col min-h-screen">
                    {/* Top Contact Bar */}
                    <div className="border-b border-white/10 hidden md:block">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex justify-between items-center text-[11px] text-white/80 font-medium tracking-widest">
                            <div className="flex items-center gap-8">
                                <span className="flex items-center gap-2 hover:text-[#e39c5f] transition-colors cursor-pointer"><Phone size={13}/> +00 (123) 456 7890</span>
                                <span className="flex items-center gap-2 hover:text-[#e39c5f] transition-colors cursor-pointer"><Mail size={13}/> INFO@UNINEST.COM</span>
                            </div>
                            <div className="flex items-center gap-5">
                                <HomeIcon size={13} className="hover:text-[#e39c5f] cursor-pointer transition-colors" />
                                <Twitter size={13} className="hover:text-[#e39c5f] cursor-pointer transition-colors" />
                                <Facebook size={13} className="hover:text-[#e39c5f] cursor-pointer transition-colors" />
                                <Instagram size={13} className="hover:text-[#e39c5f] cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Main Navbar */}
                    <div className="border-b border-white/10">
                        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
                            {/* Logo Text Match Image */}
                            <div className="text-2xl font-serif text-white tracking-[0.15em] uppercase">
                                UNINEST
                            </div>
                            
                            {/* Nav Links */}
                            <div className="flex flex-wrap justify-center md:items-center gap-6 md:gap-8 text-[11px] text-white/80 font-semibold uppercase tracking-widest">
                                {/*<Link to="/" className="text-[#e39c5f]">Home</Link>*/}
                                {/*<span className="hover:text-[#e39c5f] transition-colors flex items-center gap-1 cursor-pointer">Pages <ChevronDown size={14}/></span>*/}
                                {/*<span className="hover:text-[#e39c5f] transition-colors flex items-center gap-1 cursor-pointer">Features <ChevronDown size={14}/></span> */}
                                <Link to="/login" className="hover:text-[#e39c5f] transition-colors">Login</Link>
                                <Link to="/signup" className="hover:text-[#e39c5f] transition-colors">Register</Link>
                                <Link to="/admin-login" className="hover:text-[#e39c5f] transition-colors">Admin Area</Link>
                            </div>
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div className="flex-1 flex flex-col justify-center items-center text-center px-4 md:-mt-10">
                        <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-serif text-white mb-6 tracking-wide drop-shadow-md">
                            Smart Hostel Living
                        </h1>
                        <div className="w-20 h-1 bg-[#e39c5f] mb-8"></div>
                        <p className="text-white/90 max-w-2xl mx-auto text-sm md:text-lg mb-12 leading-relaxed font-light drop-shadow">
                            Experience the best in hostel management. Keep track of room allocations, seamlessly log complaints, and manage your accommodation securely from anywhere.
                        </p>
                        <Link to="/signup" className="px-8 py-4 bg-[#e39c5f] hover:bg-[#cf884b] text-white text-[12px] font-bold tracking-widest uppercase transition-colors shadow-lg">
                            Get Started Today
                        </Link>
                    </div>
                </div>
            </div>

            {/* About / Features Section */}
            <section className="py-24 bg-white text-center px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Aliquam Erat Volutpat is Latin but lets match the template or contextualize it */}
                    <h2 className="text-3xl md:text-4xl font-serif text-slate-800 mb-6 tracking-wide">There was a range of interest</h2>
                    <div className="w-16 h-1 bg-[#e39c5f] mx-auto mb-10"></div>
                    <p className="text-slate-500 leading-relaxed max-w-3xl mx-auto text-lg mb-20 font-light">
                        Discover modern hostel features tailored for convenience, security, and an optimized living experience. Join thousands of students who have simplified their accommodations seamlessly through our platform.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                        {/* Feature 1 */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left group">
                            <div className="w-16 h-16 border border-slate-200 flex items-center justify-center rounded-full mb-6 group-hover:border-[#e39c5f] transition-colors">
                                <Building className="text-[#e39c5f]" size={28} />
                            </div>
                            <h3 className="text-xl font-serif text-slate-800 mb-4">Modern Facilities</h3>
                            <p className="text-slate-500 font-light leading-relaxed">
                                Easily browse available rooms, submit room change requests, and maintain a history of your allocations.
                            </p>
                        </div>
                        {/* Feature 2 */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left group">
                            <div className="w-16 h-16 border border-slate-200 flex items-center justify-center rounded-full mb-6 group-hover:border-[#e39c5f] transition-colors">
                                <ShieldCheck className="text-[#e39c5f]" size={28} />
                            </div>
                            <h3 className="text-xl font-serif text-slate-800 mb-4">Secure & Validated</h3>
                            <p className="text-slate-500 font-light leading-relaxed">
                                Track notices and alerts instantly while ensuring all entries and leave logs are monitored diligently.
                            </p>
                        </div>
                        {/* Feature 3 */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left group">
                            <div className="w-16 h-16 border border-slate-200 flex items-center justify-center rounded-full mb-6 group-hover:border-[#e39c5f] transition-colors">
                                <Clock className="text-[#e39c5f]" size={28} />
                            </div>
                            <h3 className="text-xl font-serif text-slate-800 mb-4">24/7 Operations</h3>
                            <p className="text-slate-500 font-light leading-relaxed">
                                Experience hassle-free tracking of your payments and receive quick resolutions for any logged complaints.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="bg-[#1a1e24] text-slate-400 py-16 font-sans">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
                    <div>
                        <h4 className="text-xl font-serif text-white mb-6 uppercase tracking-wider">UNINEST</h4>
                        <p className="text-sm leading-relaxed mb-6 font-light text-slate-400">
                            Providing the best management solutions for modern accommodations and student housing around the world.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 flex items-center justify-center hover:text-white transition-all cursor-pointer">
                                <Facebook size={16} />
                            </div>
                            <div className="w-8 h-8 flex items-center justify-center hover:text-white transition-all cursor-pointer">
                                <Twitter size={16} />
                            </div>
                            <div className="w-8 h-8 flex items-center justify-center hover:text-white transition-all cursor-pointer">
                                <Instagram size={16} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[13px] font-bold text-white mb-6 uppercase tracking-wider">Useful Links</h4>
                        <ul className="space-y-3 text-sm font-light">
                            <li><Link to="/" className="hover:text-[#e39c5f] transition-colors">About Us</Link></li>
                            <li><Link to="/" className="hover:text-[#e39c5f] transition-colors">Our Rooms</Link></li>
                            <li><Link to="/" className="hover:text-[#e39c5f] transition-colors">Contact Support</Link></li>
                            <li><Link to="/" className="hover:text-[#e39c5f] transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[13px] font-bold text-white mb-6 uppercase tracking-wider">Services</h4>
                        <ul className="space-y-3 text-sm font-light">
                            <li><Link to="/signup" className="hover:text-[#e39c5f] transition-colors">Student Registration</Link></li>
                            <li><Link to="/login" className="hover:text-[#e39c5f] transition-colors">Dashboard Login</Link></li>
                            <li><Link to="/admin-login" className="hover:text-[#e39c5f] transition-colors">Admin Portal</Link></li>
                            <li><Link to="/" className="hover:text-[#e39c5f] transition-colors">Report Issue</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[13px] font-bold text-white mb-6 uppercase tracking-wider">Newsletter</h4>
                        <p className="text-sm mb-4 font-light text-slate-400">Subscribe to get the latest updates directly to your inbox.</p>
                        <div className="flex">
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                className="bg-[#111418] text-white px-4 py-3 w-full text-[13px] outline-none border-none" 
                            />
                            <button className="bg-[#e39c5f] hover:bg-[#cf884b] text-white px-5 py-3 transition-colors">
                                <ArrowRight size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Footer Bottom */}
                <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16 pt-8 border-t border-white/5 text-[12px] uppercase tracking-wider flex flex-col md:flex-row justify-between items-center font-semibold text-slate-500">
                    <p>© {new Date().getFullYear()} UNINEST . All Rights Reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;

