import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, CheckCircle, ChevronRight, AlertCircle, Upload, BedDouble, Coffee, Users, Wifi, Wind, Droplets, BookOpen, Clock, Building, AlertTriangle, UserX } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/studentDashboard/StudentNavbar';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'react-toastify';

export default function StudentProfile() {
    const location = useLocation();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Form states
    const [step, setStep] = useState(0); 
    const [preferences, setPreferences] = useState({
        room: { roomType: 'Any', floorPreference: 'Any', bedPreference: 'Any' },
        lifestyle: { sleepTime: '', studyPreference: '' },
        roommate: { sameDepartment: false, sameYear: false, sameLanguage: false, any: true },
        facilities: { isAC: false, attachedBathroom: false, wifiPriority: false }
    });
    
    // Crop states
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = React.useRef(null);

    const [profileCompletion, setProfileCompletion] = useState(10);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/students/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            if (res.data.preferences) {
                setPreferences(res.data.preferences);
            }
            if (res.data.profileCompletion) {
                setProfileCompletion(res.data.profileCompletion);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAcknowledgeWarning = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/students/warning/acknowledge', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(prev => ({ ...prev, warningAcknowledged: true }));
            toast.success('Warning acknowledged. Thank you for your attention.');
        } catch (err) {
            console.error('Failed to acknowledge warning', err);
            toast.error('Error acknowledging the warning. Please try again.');
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('edit') === 'true' && profile && step === 0) {
            if (profile.status !== 'Inactive' && profile.status !== 'Deleted') {
                startWizard();
            }
            navigate('/student/profile', { replace: true });
        }
    }, [location.search, profile, step, navigate]);

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const newCompletion = 100;
            const res = await axios.put('http://localhost:5000/api/students/profile', {
                preferences,
                profileCompletion: newCompletion
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setProfileCompletion(newCompletion);
            setStep(0); // Back to profile view
            toast.success('Profile preferences updated successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to save profile preferences.');
        }
    };

    const handlePicUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImgSrc(reader.result?.toString() || '');
            setCropModalOpen(true);
        });
        reader.readAsDataURL(file);
        e.target.value = null; // Clear input
    };

    const getCroppedImgBase64 = () => {
        if (!completedCrop || !imgRef.current) return;
        const canvas = document.createElement('canvas');
        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        // Force output size to 400x400 to drastically reduce base64 size
        canvas.width = 400;
        canvas.height = 400;
        
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            400,
            400
        );
        
        // JPEG compression level 0.7 ensures it easily fits under express limits
        return canvas.toDataURL('image/jpeg', 0.7);
    };

    const handleSaveCrop = async () => {
        const croppedBase64 = getCroppedImgBase64();
        if (croppedBase64) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.put('http://localhost:5000/api/students/profile', {
                    profilePic: croppedBase64
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(res.data);
                setCropModalOpen(false);
                toast.success('Profile picture updated successfully!');
            } catch (err) {
                console.error("Error uploading profile pic", err);
                toast.error('Failed to upload profile picture.');
            }
        } else {
            setCropModalOpen(false);
        }
    };

    const startWizard = () => {
        setStep(1);
        setProfileCompletion(40);
    };

    const nextStep = () => {
        if (step === 1) setProfileCompletion(50);
        else if (step === 2) setProfileCompletion(70);
        else if (step === 3) setProfileCompletion(85);
        else if (step === 4) setProfileCompletion(95);
        setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            setStep(0);
            setProfileCompletion(profile?.profileCompletion || 10);
        }
    };

    const handleRoommateChange = (field, checked) => {
        setPreferences(prev => {
            const newRoommate = { ...prev.roommate };
            
            if (field === 'any') {
                if (checked) {
                    newRoommate.sameDepartment = true;
                    newRoommate.sameYear = true;
                    newRoommate.sameLanguage = true;
                    newRoommate.any = true;
                } else {
                    newRoommate.any = false;
                }
            } else {
                newRoommate[field] = checked;
                if (!checked) {
                    newRoommate.any = false;
                } else if (newRoommate.sameDepartment && newRoommate.sameYear && newRoommate.sameLanguage) {
                    newRoommate.any = true;
                }
            }
            
            return {
                ...prev,
                roommate: newRoommate
            };
        });
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">Step 1: Room Preferences</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Room Type</label>
                    <select 
                        value={preferences.room.roomType} 
                        onChange={e => setPreferences({...preferences, room: {...preferences.room, roomType: e.target.value}})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200"
                    >
                        <option>Single</option>
                        <option>Double</option>
                        <option>Shared</option>
                        <option>Any</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Floor Preference</label>
                    <select 
                        value={preferences.room.floorPreference} 
                        onChange={e => setPreferences({...preferences, room: {...preferences.room, floorPreference: e.target.value}})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200"
                    >
                        <option>Ground</option>
                        <option>1st Floor</option>
                        <option>Any</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Bed Preference</label>
                    <select 
                        value={preferences.room.bedPreference} 
                        onChange={e => setPreferences({...preferences, room: {...preferences.room, bedPreference: e.target.value}})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200"
                    >
                        <option>Near window</option>
                        <option>Corner</option>
                        <option>Any</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button onClick={prevStep} className="px-5 py-2.5 text-slate-400 hover:text-slate-200 font-medium transition-colors">Cancel</button>
                <button onClick={nextStep} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">Next <ChevronRight className="w-4 h-4"/></button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">Step 2: Lifestyle Preferences</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Sleep Time</label>
                    <select 
                        value={preferences.lifestyle.sleepTime} 
                        onChange={e => setPreferences({...preferences, lifestyle: {...preferences.lifestyle, sleepTime: e.target.value}})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200"
                    >
                        <option value="">Select...</option>
                        <option>Early sleeper</option>
                        <option>Late sleeper</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Study Preference</label>
                    <select 
                        value={preferences.lifestyle.studyPreference} 
                        onChange={e => setPreferences({...preferences, lifestyle: {...preferences.lifestyle, studyPreference: e.target.value}})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200"
                    >
                        <option value="">Select...</option>
                        <option>Quiet environment</option>
                        <option>Group study</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-between pt-6 border-t border-slate-800">
                <button onClick={prevStep} className="px-5 py-2.5 text-slate-400 hover:text-slate-200 font-medium transition-colors">Back</button>
                <button onClick={nextStep} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium shadow-lg shadow-indigo-500/20 transition-all">Next</button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">Step 3: Roommate Preferences</h3>
            <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg cursor-pointer transition-colors hover:border-indigo-500/30">
                    <input type="checkbox" checked={preferences.roommate.sameDepartment} onChange={e => handleRoommateChange('sameDepartment', e.target.checked)} className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-500 cursor-pointer" />
                    <span className="text-slate-200 font-medium">Same Department</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg cursor-pointer transition-colors hover:border-indigo-500/30">
                    <input type="checkbox" checked={preferences.roommate.sameYear} onChange={e => handleRoommateChange('sameYear', e.target.checked)} className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-500 cursor-pointer" />
                    <span className="text-slate-200 font-medium">Same Year</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg cursor-pointer transition-colors hover:border-indigo-500/30">
                    <input type="checkbox" checked={preferences.roommate.sameLanguage} onChange={e => handleRoommateChange('sameLanguage', e.target.checked)} className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-500 cursor-pointer" />
                    <span className="text-slate-200 font-medium">Same Language</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg cursor-pointer transition-colors hover:border-indigo-500/50">
                    <input type="checkbox" checked={preferences.roommate.any} onChange={e => handleRoommateChange('any', e.target.checked)} className="w-5 h-5 rounded border-indigo-500 bg-slate-800 text-indigo-500 cursor-pointer" />
                    <span className="text-indigo-200 font-medium">Any roommate (Selects all)</span>
                </label>
            </div>
            <div className="flex justify-between pt-6 border-t border-slate-800">
                <button onClick={prevStep} className="px-5 py-2.5 text-slate-400 hover:text-slate-200 font-medium transition-colors">Back</button>
                <button onClick={nextStep} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium shadow-lg shadow-indigo-500/20 transition-all">Next</button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">Step 4: Facilities Preference</h3>
            <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/80 hover:border-indigo-500/50 transition-colors rounded-lg cursor-pointer">
                    <span className="text-slate-200 font-medium">AC Room</span>
                    <input type="checkbox" checked={preferences.facilities.isAC} onChange={e => setPreferences({...preferences, facilities: {...preferences.facilities, isAC: e.target.checked}})} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/80 hover:border-indigo-500/50 transition-colors rounded-lg cursor-pointer">
                    <span className="text-slate-200 font-medium">Attached Bathroom</span>
                    <input type="checkbox" checked={preferences.facilities.attachedBathroom} onChange={e => setPreferences({...preferences, facilities: {...preferences.facilities, attachedBathroom: e.target.checked}})} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/80 hover:border-indigo-500/50 transition-colors rounded-lg cursor-pointer">
                    <span className="text-slate-200 font-medium">WiFi Priority</span>
                    <input type="checkbox" checked={preferences.facilities.wifiPriority} onChange={e => setPreferences({...preferences, facilities: {...preferences.facilities, wifiPriority: e.target.checked}})} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                </label>
            </div>
            <div className="flex justify-between pt-6 border-t border-slate-800">
                <button onClick={prevStep} className="px-5 py-2.5 text-slate-400 hover:text-slate-200 font-medium transition-colors">Back</button>
                <button onClick={nextStep} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium shadow-lg shadow-indigo-500/20 transition-all">View Summary</button>
            </div>
        </div>
    );

    const renderSummary = () => (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">Summary of Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
                    <h4 className="text-indigo-400 font-semibold mb-3">Room</h4>
                    <ul className="text-slate-300 space-y-2">
                        <li><span className="text-slate-500 font-medium mr-2">Type:</span> {preferences.room.roomType}</li>
                        <li><span className="text-slate-500 font-medium mr-2">Floor:</span> {preferences.room.floorPreference}</li>
                        <li><span className="text-slate-500 font-medium mr-2">Bed:</span> {preferences.room.bedPreference}</li>
                    </ul>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
                    <h4 className="text-indigo-400 font-semibold mb-3">Lifestyle</h4>
                    <ul className="text-slate-300 space-y-2">
                        <li><span className="text-slate-500 font-medium mr-2">Sleep:</span> {preferences.lifestyle.sleepTime || 'Not Selected'}</li>
                        <li><span className="text-slate-500 font-medium mr-2">Study:</span> {preferences.lifestyle.studyPreference || 'Not Selected'}</li>
                    </ul>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
                    <h4 className="text-indigo-400 font-semibold mb-3">Roommate</h4>
                    <ul className="text-slate-300 space-y-1 mt-2">
                        {preferences.roommate.sameDepartment && <li>• Same Department</li>}
                        {preferences.roommate.sameYear && <li>• Same Year</li>}
                        {preferences.roommate.sameLanguage && <li>• Same Language</li>}
                        {preferences.roommate.any && <li>• Any Roommate</li>}
                        {!preferences.roommate.sameDepartment && !preferences.roommate.sameYear && !preferences.roommate.sameLanguage && !preferences.roommate.any && <li>No specific constraints</li>}
                    </ul>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
                    <h4 className="text-indigo-400 font-semibold mb-3">Facilities</h4>
                    <ul className="text-slate-300 space-y-2">
                        <li><span className="text-slate-500 font-medium mr-2">AC:</span> {preferences.facilities.isAC ? 'Yes' : 'No'}</li>
                        <li><span className="text-slate-500 font-medium mr-2">Attached Bath:</span> {preferences.facilities.attachedBathroom ? 'Yes' : 'No'}</li>
                        <li><span className="text-slate-500 font-medium mr-2">WiFi:</span> {preferences.facilities.wifiPriority ? 'Yes' : 'No'}</li>
                    </ul>
                </div>
            </div>
            
            <div className="flex justify-between pt-6 border-t border-slate-800">
                <button onClick={prevStep} className="px-5 py-2.5 text-slate-400 hover:text-slate-200 font-medium transition-colors">Back</button>
                <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all">
                    <CheckCircle className="w-5 h-5"/> Complete Profile
                </button>
            </div>
        </div>
    );

    if (loading) return <div className="flex justify-center items-center h-screen bg-slate-950"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent flex rounded-full animate-spin"></div></div>;

    const initials = profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}` : 'S';

    return (
        <div className="flex flex-col h-full bg-slate-950 font-sans w-full relative">
            <StudentNavbar profile={profile} />
            <div className="p-4 sm:p-8 animate-fade-in custom-scrollbar overflow-y-auto w-full">
                <div className="max-w-6xl mx-auto w-full">
                    
                    <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-6 pb-2">
                        Student Profile
                    </h1>

                    {profile?.status === 'Deleted' ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                            <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-[2rem] text-center max-w-lg shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600"></div>
                                <UserX className="w-20 h-20 text-red-500 mx-auto mb-6" />
                                <h2 className="text-3xl font-extrabold text-slate-100 mb-3 tracking-tight">Account Vacated</h2>
                                <p className="text-slate-400 font-medium leading-relaxed">
                                    Your student account has been completely vacated and deleted by the hostel administration. You no longer have active access to the hostel portal or bookings.
                                </p>
                                <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="mt-8 px-8 py-3 bg-slate-900 border border-slate-700 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 text-slate-300 rounded-xl transition-all font-bold tracking-wider">
                                    SIGN OUT
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            {/* Warnings / Inactive Modifiers */}
                            {profile?.adminWarning && !profile?.warningAcknowledged && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.1)] relative overflow-hidden">
                                    <div className="absolute left-0 inset-y-0 w-1 bg-red-500"></div>
                                    <div className="flex gap-4 items-start">
                                        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-red-400 font-bold mb-1 uppercase tracking-wider text-sm">Administration Warning</h4>
                                            <p className="text-red-200 text-sm font-medium leading-relaxed">{profile.adminWarning}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleAcknowledgeWarning}
                                        className="sm:ml-auto shrink-0 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-md flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4"/> Considered
                                    </button>
                                </div>
                            )}

                            {profile?.status === 'Inactive' && (
                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-6 flex gap-4 items-start relative overflow-hidden">
                                    <div className="absolute left-0 inset-y-0 w-1 bg-orange-500"></div>
                                    <Clock className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-orange-400 font-bold mb-1 uppercase tracking-wider text-sm">Account Inactive</h4>
                                        <p className="text-orange-200 text-sm font-medium leading-relaxed">Your account has been marked as inactive by administration. Certain features like editing preferences are locked.</p>
                                    </div>
                                </div>
                            )}

                        {step === 0 ? (
                            <div className="space-y-6">
                            {/* Hero Banner Card */}
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                                <div className="h-32 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 relative">
                                    <div className="absolute inset-0 bg-slate-900/40"></div>
                                </div>
                                <div className="px-6 sm:px-10 pb-8 relative -mt-12">
                                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end mb-6">
                                        <div className="relative group cursor-pointer w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800 shrink-0 shadow-2xl transition-transform hover:scale-105">
                                            {profile?.profilePic ? (
                                                <img src={profile.profilePic.startsWith('data:image') || profile.profilePic.startsWith('http') ? profile.profilePic : `http://localhost:5000${profile.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-indigo-400">{initials}</span>
                                            )}
                                            {/* Avatar Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                                <Upload className="w-5 h-5 text-indigo-400"/>
                                                <span className="text-[10px] font-semibold text-slate-200 uppercase tracking-widest">Upload</span>
                                            </div>
                                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handlePicUpload} />
                                        </div>
                                        
                                        <div className="flex-1 pb-2">
                                            <h2 className="text-3xl font-bold text-slate-100 tracking-tight">{profile?.firstName} {profile?.lastName}</h2>
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/20">{profile?.registrationNumber || 'No ID'}</span>
                                                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs uppercase tracking-widest font-bold rounded-full border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                                    Active Student
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Action Button */}
                                        <div className="w-full sm:w-auto pb-2 flex-shrink-0">
                                            {profile?.status === 'Inactive' ? (
                                                <button disabled className="w-full sm:w-auto px-6 py-3 bg-slate-800 border-slate-700 text-slate-500 opacity-70 cursor-not-allowed rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                                                    Editing Locked
                                                </button>
                                            ) : profileCompletion < 100 ? (
                                                <button onClick={startWizard} className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2">
                                                    <User className="w-5 h-5"/> Complete Profile Now
                                                </button>
                                            ) : (
                                                <button onClick={startWizard} className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                                                    Edit Preferences
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Profile Completion Bar inside Hero */}
                                    <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800/50">
                                        <div className="flex justify-between text-sm mb-3">
                                            <span className="font-semibold text-slate-300">Profile Completion</span>
                                            <span className={`font-bold ${
                                                profileCompletion === 100 ? 'text-green-400' : 
                                                profileCompletion <= 10 ? 'text-red-400' : 'text-blue-400'
                                            }`}>{profileCompletion}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                    profileCompletion === 100 ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 
                                                    profileCompletion <= 10 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                                                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                                                }`} 
                                                style={{ width: `${profileCompletion}%` }}
                                            ></div>
                                        </div>
                                        {profileCompletion < 100 && (
                                            <p className="text-xs text-yellow-500 mt-3 flex items-center gap-1.5 font-medium">
                                                <AlertCircle className="w-4 h-4" /> Please complete your profile to unlock all features!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Main Details Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Registration Details */}
                                <div className="space-y-6 lg:col-span-1">
                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl h-full">
                                        <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2 pb-4 border-b border-slate-800">
                                            <User className="w-5 h-5 text-indigo-400" /> Registration Details
                                        </h3>
                                        <div className="space-y-5">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold mb-1.5 uppercase tracking-widest">Email Address</p>
                                                <p className="text-slate-200 font-medium break-all bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">{profile?.userId?.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold mb-1.5 uppercase tracking-widest">Phone Number</p>
                                                <p className="text-slate-200 font-medium bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">{profile?.contactNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold mb-1.5 uppercase tracking-widest">Course Enrolled</p>
                                                <p className="text-slate-200 font-medium bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">{profile?.course || 'N/A'}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold mb-1.5 uppercase tracking-widest">Enroll. Year</p>
                                                    <p className="text-slate-200 font-medium bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">{profile?.batchYear || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold mb-1.5 uppercase tracking-widest">Gender</p>
                                                    <p className="text-slate-200 font-medium bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">{profile?.gender || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6 lg:col-span-2">
                                    {/* Accommodation Status */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                                        <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2 pb-4 border-b border-slate-800">
                                            <Building className="w-5 h-5 text-indigo-400" /> Accommodation Status
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/40 flex flex-col justify-center items-center text-center">
                                                <p className="text-[10px] text-slate-500 font-bold mb-3 uppercase tracking-widest">Booking Status</p>
                                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                                    <CheckCircle className="w-4 h-4" /> Approved
                                                </span>
                                            </div>
                                            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/40 flex flex-col justify-center items-center text-center">
                                                <p className="text-[10px] text-slate-500 font-bold mb-3 uppercase tracking-widest">Allocation</p>
                                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(79,70,229,0.1)]">
                                                    <BedDouble className="w-4 h-4" /> Assigned
                                                </span>
                                            </div>
                                            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/40 flex flex-col justify-center items-center text-center">
                                                <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest">Room Number</p>
                                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-md">
                                                    A-204
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* My Preferences Grid (Fully Detailed) */}
                                    {profileCompletion === 100 && (
                                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                                                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-400" /> My Saved Preferences
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {/* Room Card */}
                                                <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/40 hover:border-indigo-500/30 transition-all flex flex-col">
                                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700/50">
                                                        <div className="p-2 bg-indigo-500/10 rounded-lg"><BedDouble className="w-5 h-5 text-indigo-400" /></div>
                                                        <span className="text-slate-200 font-bold text-lg">Room</span>
                                                    </div>
                                                    <div className="space-y-3 px-1">
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Type</span><span className="text-slate-200 font-semibold">{preferences.room?.roomType || 'N/A'}</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Floor</span><span className="text-slate-200 font-semibold">{preferences.room?.floorPreference || 'N/A'}</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Bed</span><span className="text-slate-200 font-semibold">{preferences.room?.bedPreference || 'N/A'}</span></div>
                                                    </div>
                                                </div>

                                                {/* Lifestyle Card */}
                                                <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/40 hover:border-indigo-500/30 transition-all flex flex-col">
                                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700/50">
                                                        <div className="p-2 bg-indigo-500/10 rounded-lg"><Coffee className="w-5 h-5 text-indigo-400" /></div>
                                                        <span className="text-slate-200 font-bold text-lg">Lifestyle</span>
                                                    </div>
                                                    <div className="space-y-3 px-1">
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium flex items-center gap-2">Sleep</span><span className="text-slate-200 font-semibold">{preferences.lifestyle?.sleepTime || 'N/A'}</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium flex items-center gap-2">Study</span><span className="text-slate-200 font-semibold">{preferences.lifestyle?.studyPreference || 'N/A'}</span></div>
                                                    </div>
                                                </div>

                                                {/* Roommate Card */}
                                                <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/40 hover:border-indigo-500/30 transition-all flex flex-col">
                                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700/50">
                                                        <div className="p-2 bg-indigo-500/10 rounded-lg"><Users className="w-5 h-5 text-indigo-400" /></div>
                                                        <span className="text-slate-200 font-bold text-lg">Roommate</span>
                                                    </div>
                                                    <div className="px-1 flex flex-wrap gap-2">
                                                        {preferences.roommate?.any ? (
                                                            <div className="text-sm text-green-400 font-semibold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Open to any roommate</div>
                                                        ) : (
                                                            <>
                                                                {preferences.roommate?.sameDepartment && <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/20">Same Dept.</span>}
                                                                {preferences.roommate?.sameYear && <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/20">Same Year</span>}
                                                                {preferences.roommate?.sameLanguage && <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/20">Same Language</span>}
                                                                {!preferences.roommate?.sameDepartment && !preferences.roommate?.sameYear && !preferences.roommate?.sameLanguage && <span className="text-slate-500 text-sm">No restrictions set</span>}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Facilities Card */}
                                                <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/40 hover:border-indigo-500/30 transition-all flex flex-col">
                                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700/50">
                                                        <div className="p-2 bg-indigo-500/10 rounded-lg"><Building className="w-5 h-5 text-indigo-400" /></div>
                                                        <span className="text-slate-200 font-bold text-lg">Facilities</span>
                                                    </div>
                                                    <div className="space-y-3 px-1">
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">AC</span><span className={preferences.facilities?.isAC ? "text-green-400 font-bold" : "text-slate-400"}>{preferences.facilities?.isAC ? 'Required' : 'Opt-out'}</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Bath</span><span className={preferences.facilities?.attachedBathroom ? "text-green-400 font-bold" : "text-slate-400"}>{preferences.facilities?.attachedBathroom ? 'Required' : 'Shared Ok'}</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">WiFi</span><span className={preferences.facilities?.wifiPriority ? "text-green-400 font-bold" : "text-slate-400"}>{preferences.facilities?.wifiPriority ? 'High Priority' : 'Standard'}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                                {/* Ambient Background Glow for Wizard */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
                                
                                <div className="relative z-10">
                                    <div className="mb-10">
                                        <div className="flex justify-between text-sm mb-3">
                                            <span className="font-semibold text-slate-300">Wizard Progress</span>
                                            <span className={`font-bold ${
                                                profileCompletion === 100 ? 'text-green-400' : 
                                                profileCompletion <= 10 ? 'text-red-400' : 'text-blue-400'
                                            }`}>{profileCompletion}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                    profileCompletion === 100 ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 
                                                    profileCompletion <= 10 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                                                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                                                }`} 
                                                style={{ width: `${profileCompletion}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {step === 1 && renderStep1()}
                                    {step === 2 && renderStep2()}
                                    {step === 3 && renderStep3()}
                                    {step === 4 && renderStep4()}
                                    {step === 5 && renderSummary()}
                                </div>
                            </div>
                        </div>
                    )}
                        </div>
                    )}
                </div>
            </div>

            {/* Crop Overlay Modal */}
            {cropModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-100 mb-4">Crop Profile Picture</h3>
                        <div className="bg-slate-950 flex justify-center items-center overflow-hidden rounded-xl border border-slate-800 mb-6 h-[50vh] min-h-[300px]">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                circularCrop
                            >
                                <img
                                    ref={imgRef}
                                    src={imgSrc}
                                    alt="Crop me"
                                    className="max-h-[50vh] object-contain"
                                />
                            </ReactCrop>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setCropModalOpen(false)} className="px-5 py-2.5 text-slate-400 hover:text-slate-200 font-medium">Cancel</button>
                            <button onClick={handleSaveCrop} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium shadow-lg transition-all">Save Picture</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
