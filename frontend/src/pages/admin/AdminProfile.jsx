import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Briefcase, Hash, Calendar, Camera, Save } from 'lucide-react';

const AdminProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Edit form states
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', department: '' });
    const [profilePic, setProfilePic] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    
    // Status messages
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/api/admin/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setFormData({
                firstName: res.data.firstName || '',
                lastName: res.data.lastName || '',
                department: res.data.department || ''
            });
            if (res.data.profilePic) {
                 setPreviewUrl(`http://localhost:5000${res.data.profilePic}`);
            }
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error loading profile');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            const token = localStorage.getItem('adminToken');
            const data = new FormData();
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('department', formData.department);
            if (profilePic) {
                data.append('profilePic', profilePic);
            }

            const res = await axios.put('http://localhost:5000/api/admin/profile', data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data' is omitted, axios handles it automatically with FormData
                }
            });
            
            setProfile(res.data);
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            
            // Update local storage user data to instantly reflect changes on navbar
            const userStr = localStorage.getItem('adminUser');
            if(userStr) {
                 const usr = JSON.parse(userStr);
                 usr.name = `${res.data.firstName} ${res.data.lastName}`;
                 localStorage.setItem('user', JSON.stringify(usr));
                 // Trigger a custom event to notify Navbar
                 window.dispatchEvent(new Event('user-profile-updated'));
            }
            
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update profile');
        }
    };

    if (loading) return <div className="text-slate-400 p-8 text-center animate-pulse">Loading Profile...</div>;
    if (!profile) return <div className="text-danger p-8">Unable to load profile data.</div>;

    return (
        <div className="max-w-4xl mx-auto glass-container animate-fade-in p-8">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <User className="text-indigo-400" /> Admin Profile
                </h2>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="bg-indigo-600/20 text-indigo-400 hover:text-white hover:bg-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6">{error}</div>}
            {success && <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-6">{success}</div>}

            <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Left Column: Picture */}
                <div className="flex flex-col items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 w-full md:w-1/3 shadow-inner">
                    <div className="relative group w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-500/20 bg-slate-800 shadow-2xl">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Admin Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-indigo-300">
                                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                            </div>
                        )}
                        {isEditing && (
                            <label className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 mb-2" />
                                <span className="text-sm font-medium">Change Photo</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white capitalize">{profile.firstName} {profile.lastName}</h3>
                        <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-semibold tracking-wider uppercase mt-2 border border-indigo-500/20">
                            {profile.roleLevel}
                        </span>
                    </div>
                </div>

                {/* Right Column: Details / Form */}
                <div className="flex-1 w-full bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 shadow-inner">
                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
                                    <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:bg-slate-700/50 transition-colors" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
                                    <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:bg-slate-700/50 transition-colors" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 pl-10 focus:border-indigo-500 focus:bg-slate-700/50 transition-colors" />
                                </div>
                            </div>

                            {/* Read-only fields info */}
                            <div className="pt-4 border-t border-slate-800/50 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Email <span className="text-xs text-slate-600">(Cannot be changed)</span></label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <input type="text" value={profile.userId?.email || 'N/A'} disabled className="w-full bg-slate-900 border border-slate-800/50 text-slate-500 rounded-lg px-4 py-2.5 pl-10 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Employee ID <span className="text-xs text-slate-600">(Cannot be changed)</span></label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <input type="text" value={profile.employeeId} disabled className="w-full bg-slate-900 border border-slate-800/50 text-slate-500 rounded-lg px-4 py-2.5 pl-10 cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-800/50 mt-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium">Cancel</button>
                                <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-md shadow-indigo-500/20 transition-all active:scale-95">
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem icon={<User className="text-blue-400"/>} label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
                                <DetailItem icon={<Briefcase className="text-purple-400"/>} label="Department" value={profile.department || 'Not Assigned'} />
                                <DetailItem icon={<Mail className="text-rose-400"/>} label="Email Address" value={profile.userId?.email || 'N/A'} />
                                <DetailItem icon={<Hash className="text-emerald-400"/>} label="Employee ID" value={profile.employeeId} />
                            </div>
                            <div className="pt-6 border-t border-slate-800/50">
                                <DetailItem icon={<Calendar className="text-amber-400"/>} label="Joined Date" value={new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper component for read-only details
const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 shadow-inner">
            {icon}
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-slate-200 font-medium">{value}</p>
        </div>
    </div>
);

export default AdminProfile;
