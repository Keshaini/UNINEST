import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Hash, Briefcase, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import logo from '../assets/logo.png';

const InputField = ({ icon: Icon, type, name, placeholder, label, value, errorMsg, isFocused, onFocus, onBlur, onChange, showPassword, showConfirmPassword, onTogglePassword }) => {
    const hasError = !!errorMsg;
    
    let actualType = type;
    if (type === 'password') {
        if (name === 'password' && showPassword) actualType = 'text';
        if (name === 'confirmPassword' && showConfirmPassword) actualType = 'text';
    }

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className={`text-xs font-semibold uppercase tracking-wider ${isFocused ? 'text-emerald-400' : 'text-slate-400'} transition-colors pl-1`}>
                {label}
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className={`w-5 h-5 ${hasError ? 'text-rose-400' : isFocused ? 'text-emerald-400' : 'text-slate-500'} transition-colors`} />
                </div>
                <input
                    type={actualType}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={() => onFocus(name)}
                    onBlur={onBlur}
                    required
                    className={`w-full bg-slate-800/50 text-slate-100 rounded-xl pl-10 pr-10 py-3 outline-none transition-all duration-300 border backdrop-blur-sm
                        ${hasError 
                            ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)] focus:border-rose-500 focus:shadow-[0_0_20px_rgba(244,63,94,0.2)]' 
                            : 'border-slate-700/50 focus:border-emerald-500/80 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:border-slate-600'
                        }
                    `}
                />
                {type === 'password' && (
                    <button 
                        type="button" 
                        onClick={() => onTogglePassword(name)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                        {(name === 'password' ? showPassword : showConfirmPassword) ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                )}
            </div>
            {hasError && <p className="text-xs text-rose-400 pl-1 animate-fade-in">{errorMsg}</p>}
        </div>
    );
};

function AdminRegister() {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '',
        employeeId: '', department: '', roleLevel: 'Warden',
        password: '', confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    const [fieldErrors, setFieldErrors] = useState({});

    // Simple robust validation
    const validateField = (name, value) => {
        let msg = '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (name === 'email') {
            if (!value.trim()) msg = 'Email is required';
            else if (!emailRegex.test(value)) msg = 'Enter a valid email address';
        } else if (['firstName', 'lastName'].includes(name) && value.trim() && !/^[a-zA-Z\s]+$/.test(value)) {
            msg = 'Letters and spaces only';
        } else if (name === 'password' && value && value.length < 6) {
            msg = 'Minimum 6 characters';
        } else if (name === 'confirmPassword' && value && formData.password && value !== formData.password) {
            msg = 'Passwords do not match';
        }
        setFieldErrors(prev => ({ ...prev, [name]: msg }));
        return !msg;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Trigger all validations
        let isValid = true;
        Object.keys(formData).forEach(key => {
            if (!validateField(key, formData[key])) isValid = false;
        });

        if (!isValid) return;
        if (formData.password !== formData.confirmPassword) {
            setFieldErrors(prev => ({...prev, confirmPassword: 'Passwords do not match'}));
            return;
        }

        setIsLoading(true);
        setSuccess('');

        try {
            const payload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                employeeId: formData.employeeId.trim(),
                department: formData.department.trim(),
                roleLevel: formData.roleLevel,
                password: formData.password
            };

            const res = await axios.post('http://localhost:5000/api/admin/register', payload);

            setSuccess(res.data.message || 'Admin registration successful! Redirecting...');
            setTimeout(() => navigate('/admin-login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.msg || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFocus = (name) => setFocusedField(name);
    const handleBlur = () => setFocusedField(null);
    const handleTogglePassword = (name) => {
        if (name === 'password') setShowPassword(!showPassword);
        if (name === 'confirmPassword') setShowConfirmPassword(!showConfirmPassword);
    };

    const commonInputProps = (name) => ({
        name,
        value: formData[name],
        errorMsg: fieldErrors[name],
        isFocused: focusedField === name,
        onFocus: handleFocus,
        onBlur: handleBlur,
        onChange: handleChange,
        showPassword,
        showConfirmPassword,
        onTogglePassword: handleTogglePassword
    });

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500/30 font-sans">
            {/* Split Screen Container */}
            <div className="w-full max-w-6xl bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-800/60 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row-reverse">
                
                {/* Right Branding Panel - Reversed for variety */}
                <div className="hidden md:flex w-2/5 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-slate-900/80 border-l border-slate-800/50">
                    <div className="absolute top-0 left-0 -translate-y-12 -translate-x-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 translate-y-12 translate-x-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 text-right">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg text-white font-bold text-xl mb-6 ml-auto">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-white to-slate-400 leading-tight mb-4">
                            Backend<br/>System Control.
                        </h2>
                        <p className="text-slate-400 text-lg">
                            Elevated access for administrative staff, managers, and wardens.
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
                    <div className="max-w-xl mx-auto w-full">
                        <div className="mb-10 flex flex-col items-center md:items-start text-center md:text-left group cursor-pointer">
                            <img src={logo} alt="HostelPro Logo" className="h-16 sm:h-20 md:h-24 w-auto max-w-full object-contain mb-8 drop-shadow-[0_10px_15px_rgba(16,185,129,0.25)] mx-auto md:mx-0 transform transition-transform duration-500 group-hover:scale-105" />
                            <h1 className="text-3xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-emerald-300">Admin Registration</h1>
                            <p className="text-slate-400">Request secure administrative access credentials.</p>
                        </div>

                        {error && (
                            <div className="mb-6 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center text-rose-400 animate-fade-in shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}
                        
                        {success && (
                            <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center text-emerald-400 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <span className="text-sm font-medium">{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField icon={User} type="text" label="First Name" placeholder="John" {...commonInputProps('firstName')} />
                                <InputField icon={User} type="text" label="Last Name" placeholder="Doe" {...commonInputProps('lastName')} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField icon={Mail} type="email" label="Email Address" placeholder="john@admin.com" {...commonInputProps('email')} />
                                <InputField icon={Hash} type="text" label="Employee ID" placeholder="EMP-4002" {...commonInputProps('employeeId')} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField icon={Briefcase} type="text" label="Department" placeholder="Operations" {...commonInputProps('department')} />
                                
                                <div className="flex flex-col gap-1.5 w-full">
                                    <label className={`text-xs font-semibold uppercase tracking-wider text-emerald-400 transition-colors pl-1`}>
                                        Role Level
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ShieldCheck className={`w-5 h-5 text-emerald-400 transition-colors`} />
                                        </div>
                                        <select 
                                            name="roleLevel" 
                                            value={formData.roleLevel} 
                                            onChange={handleChange} 
                                            className="w-full bg-slate-800/50 text-slate-100 rounded-xl pl-10 pr-4 py-3 outline-none transition-all duration-300 border border-slate-700/50 focus:border-emerald-500/80 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] appearance-none cursor-pointer"
                                        >
                                            <option value="Warden" className="bg-slate-800">Warden</option>
                                            <option value="Manager" className="bg-slate-800">Manager</option>
                                            <option value="SuperAdmin" className="bg-slate-800">Super Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                <InputField icon={Lock} type="password" label="Password" placeholder="••••••••" {...commonInputProps('password')} />
                                <InputField icon={Lock} type="password" label="Confirm Password" placeholder="••••••••" {...commonInputProps('confirmPassword')} />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-emerald-500/50 disabled:to-teal-500/50 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98] disabled:active:scale-100"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Provisioning Access...</>
                                ) : (
                                    <><span className="tracking-wide">Register Admin</span> <ArrowRight className="w-5 h-5 ml-1 inline" /></>
                                )}
                            </button>
                            
                            <p className="text-center text-slate-400 text-sm mt-6">
                                Already an admin?{' '}
                                <Link to="/admin-login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors underline-offset-4 hover:underline">
                                    Portal Login
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminRegister;
