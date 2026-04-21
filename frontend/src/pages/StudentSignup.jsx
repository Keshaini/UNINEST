import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Hash, Phone, BookOpen, Calendar, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
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
            <label className={`text-xs font-semibold uppercase tracking-wider ${isFocused ? 'text-indigo-400' : 'text-slate-400'} transition-colors pl-1`}>
                {label}
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Icon className={`w-5 h-5 ${hasError ? 'text-rose-400' : isFocused ? 'text-indigo-400' : 'text-slate-500'} transition-colors`} />
                </div>
                
                {name === 'course' ? (
                    <select
                        name={name}
                        value={value}
                        onChange={onChange}
                        onFocus={() => onFocus(name)}
                        onBlur={onBlur}
                        required
                        className={`w-full bg-slate-800/50 text-slate-100 rounded-xl pl-10 pr-10 py-3 outline-none transition-all duration-300 border backdrop-blur-sm appearance-none cursor-pointer
                            ${hasError 
                                ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)] focus:border-rose-500 focus:shadow-[0_0_20px_rgba(244,63,94,0.2)]' 
                                : 'border-slate-700/50 focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:border-slate-600'
                            }
                        `}
                    >
                        <option value="" disabled className="bg-slate-900 text-slate-500">Select Course</option>
                        <option value="IT" className="bg-slate-900 border-none">IT</option>
                        <option value="Engineering" className="bg-slate-900 border-none">Engineering</option>
                        <option value="Biomedical" className="bg-slate-900 border-none">Biomedical</option>
                        <option value="Business" className="bg-slate-900 border-none">Business</option>
                    </select>
                ) : (
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
                                : 'border-slate-700/50 focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:border-slate-600'
                            }
                        `}
                    />
                )}

                {type === 'password' && (
                    <button 
                        type="button" 
                        onClick={() => onTogglePassword(name)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                        {(name === 'password' ? showPassword : showConfirmPassword) ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                )}
                
                {name === 'course' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                )}
            </div>
            {hasError && <p className="text-xs text-rose-400 pl-1 animate-fade-in">{errorMsg}</p>}
        </div>
    );
};

function StudentSignup() {
    const [formData, setFormData] = useState({
        fullName: '', email: '', registrationNumber: '',
        contactNumber: '', course: '', batchYear: '',
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
        } else if (name === 'fullName' && value.trim() && !/^[a-zA-Z\s]+$/.test(value)) {
            msg = 'Letters and spaces only';
        } else if (name === 'batchYear' && value) {
            const currentYear = new Date().getFullYear();
            const yearNum = parseInt(value, 10);
            if (isNaN(yearNum) || yearNum < currentYear - 3 || yearNum > currentYear) {
                msg = 'Enrollment year must be within the last 3 years or current year';
            }
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

        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

        try {
            await axios.post('http://localhost:5000/api/auth/register/student', {
                firstName,
                lastName: lastName.trim() === '' ? ' ' : lastName, 
                email: formData.email.trim(),
                registrationNumber: formData.registrationNumber.trim(),
                contactNumber: formData.contactNumber.trim(),
                course: formData.course.trim(),
                batchYear: parseInt(formData.batchYear, 10),
                password: formData.password
            });

            setSuccess('Registration successful! Redirecting...');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed. Please try again.');
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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500/30 font-sans">
            {/* Split Screen Container */}
            <div className="w-full max-w-6xl bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-800/60 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row">
                
                {/* Left Branding Panel */}
                <div className="hidden md:flex w-2/5 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900/80 border-r border-slate-800/50">
                    {/* Abstract overlapping circles overlay */}
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-lg text-white font-bold text-xl mb-6">
                            UNINEST STUDENT PORTAL
                        </div>
                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-tight mb-4">
                            Welcome to your<br/>Smart Hostel.
                        </h2>
                        <p className="text-slate-400 text-lg">
                            Manage your stay, track payments, and engage with the community seamlessly.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-xl">
                            <p className="text-slate-300 italic mb-4">"The fastest way to manage accommodation operations effortlessly."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
                                <div>
                                    <p className="text-white text-sm font-bold">Admin Team</p>
                                    <p className="text-slate-500 text-xs">University Housing</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="w-full md:w-3/5 p-8 sm:p-12 relative flex flex-col justify-center">
                    <div className="max-w-xl mx-auto w-full">
                        <div className="mb-10 flex flex-col items-center md:items-start text-center md:text-left group cursor-pointer">
                            <img src={logo} alt="HostelPro Logo" className="h-16 sm:h-20 md:h-24 w-auto max-w-full object-contain mb-8 drop-shadow-[0_10px_15px_rgba(99,102,241,0.25)] mx-auto md:mx-0 transform transition-transform duration-500 group-hover:scale-105" />
                            <h1 className="text-3xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-indigo-300">Student Registration</h1>
                            <p className="text-slate-400">Create your account to access the student portal.</p>
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

                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            <InputField icon={User} type="text" label="Full Name" placeholder="John Doe" {...commonInputProps('fullName')} />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InputField icon={Mail} type="email" label="Email Address" placeholder="john@example.com" {...commonInputProps('email')} />
                                <InputField icon={Hash} type="text" label="Registration No." placeholder="REG12345" {...commonInputProps('registrationNumber')} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InputField icon={Phone} type="tel" label="Phone Number" placeholder="+1 234 567 8900" {...commonInputProps('contactNumber')} />
                                <InputField icon={BookOpen} type="text" label="Course" placeholder="Computer Science" {...commonInputProps('course')} />
                            </div>

                            <InputField icon={Calendar} type="number" label="Enrollment Year" placeholder="2023" {...commonInputProps('batchYear')} />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InputField icon={Lock} type="password" label="Password" placeholder="••••••••" {...commonInputProps('password')} />
                                <InputField icon={Lock} type="password" label="Confirm Password" placeholder="••••••••" {...commonInputProps('confirmPassword')} />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:from-indigo-500/50 disabled:to-indigo-600/50 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all active:scale-[0.98] disabled:active:scale-100"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</>
                                ) : (
                                    <><span className="tracking-wide">Create Account</span> <ArrowRight className="w-5 h-5 ml-1 inline" /></>
                                )}
                            </button>
                            
                            <p className="text-center text-slate-400 text-sm mt-6">
                                Already have an account?{' '}
                                <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors underline-offset-4 hover:underline">
                                    Sign in instead
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentSignup;
