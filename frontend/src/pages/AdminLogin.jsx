import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import logo from '../assets/logo.png';

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            
            if (res.data.user.role !== 'Admin') {
                setError('Access denied. Please use the Student login portal.');
                setIsLoading(false);
                return;
            }

            localStorage.setItem('adminToken', res.data.token);
            localStorage.setItem('adminUser', JSON.stringify(res.data.user));
            
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid Credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500/30 font-sans">
            <div className="w-full max-w-6xl bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-800/60 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row-reverse">
                
                {/* Right Branding Panel - Reversed for Admin matching AdminRegister layout */}
                <div className="hidden md:flex w-2/5 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-slate-900/80 border-l border-slate-800/50">
                    <div className="absolute top-0 left-0 -translate-y-12 -translate-x-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 translate-y-12 translate-x-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 text-right">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg text-white font-bold text-xl mb-6 ml-auto">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-white to-slate-400 leading-tight mb-4">
                            Admin<br/>Access Portal.
                        </h2>
                        <p className="text-slate-400 text-lg">
                            Secure elevated access to manage all operations safely.
                        </p>
                    </div>

                    <div className="relative z-10 w-full flex justify-end">
                        <div className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-xl max-w-xs text-right">
                            <p className="text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed"><span className="text-emerald-400 font-bold">24/7 Monitoring</span>{"\n"}Ensure smooth hostel operational management.</p>
                            <div className="flex items-center justify-end gap-3">
                                <div className="text-right">
                                    <p className="text-white text-sm font-bold">Security Team</p>
                                    <p className="text-slate-500 text-xs">Administration</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-l from-indigo-400 to-purple-400 flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Form Panel */}
                <div className="w-full md:w-3/5 p-8 sm:p-12 md:pr-16 relative flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10 flex flex-col items-center md:items-start text-center md:text-left group cursor-pointer">
                            <img src={logo} alt="HostelPro Logo" className="h-16 sm:h-20 md:h-24 w-auto max-w-full object-contain mb-8 drop-shadow-[0_10px_15px_rgba(16,185,129,0.25)] mx-auto md:mx-0 transform transition-transform duration-500 group-hover:scale-105" />
                            <h1 className="text-3xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-emerald-300">Admin Interface</h1>
                            <p className="text-slate-400">Log in to manage records, complaints, and billing.</p>
                        </div>

                        {error && (
                            <div className="mb-6 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center text-rose-400 animate-fade-in shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            {/* Email Input */}
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className={`text-xs font-semibold uppercase tracking-wider ${focusedField === 'email' ? 'text-emerald-400' : 'text-slate-400'} transition-colors pl-1`}>
                                    Admin Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className={`w-5 h-5 ${focusedField === 'email' ? 'text-emerald-400' : 'text-slate-500'} transition-colors`} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="admin@smart-hostel.edu"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                        className={`w-full bg-slate-800/50 text-slate-100 rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-300 border border-slate-700/50 focus:border-emerald-500/80 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:border-slate-600 backdrop-blur-sm`}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className={`text-xs font-semibold uppercase tracking-wider ${focusedField === 'password' ? 'text-emerald-400' : 'text-slate-400'} transition-colors pl-1`}>
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className={`w-5 h-5 ${focusedField === 'password' ? 'text-emerald-400' : 'text-slate-500'} transition-colors`} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                        className={`w-full bg-slate-800/50 text-slate-100 rounded-xl pl-10 pr-10 py-3 outline-none transition-all duration-300 border border-slate-700/50 focus:border-emerald-500/80 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:border-slate-600 backdrop-blur-sm`}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-emerald-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                    </button>
                                </div>
                            </div>

                            {/* Extra UX */}
                            <div className="flex items-center justify-between mt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500/50 focus:ring-offset-0 bg-slate-800"
                                    />
                                    <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember Admin</span>
                                </label>
                                
                                <button type="button" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors hover:underline underline-offset-4">
                                    Lost access?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-emerald-500/50 disabled:to-teal-500/50 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98] disabled:active:scale-100"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Credentials...</>
                                ) : (
                                    <><span className="tracking-wide">Administrator Login</span> <ArrowRight className="w-5 h-5 ml-1 inline" /></>
                                )}
                            </button>
                            
                            {/* Links */}
                            <div className="flex flex-col gap-3 text-center text-sm mt-8 pt-6 border-t border-slate-800/50">
                                <p className="text-slate-400">
                                    Need an admin account?{' '}
                                    <Link to="/admin-register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors underline-offset-4 hover:underline">
                                        Request Access
                                    </Link>
                                </p>
                                <Link to="/" className="text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4 decoration-slate-700 hover:decoration-slate-500">
                                    Switch to Student Portal
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
