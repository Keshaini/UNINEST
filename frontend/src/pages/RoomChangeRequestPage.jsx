import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  createRoomChangeRequest
} from '../services/hostelApi';

const defaultForm = {
  studentName: '',
  studentId: '',
  currentRoomNumber: '',
  requestedRoomNumber: '',
  reason: '',
  priority: 'Medium',
  status: 'Pending'
};

function RoomChangeRequestPage() {
  const [formData, setFormData] = useState(defaultForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    if (!formData.studentName.trim()) return 'Student name is required.';
    if (!formData.studentId.trim()) return 'Student ID is required.';
    if (!formData.currentRoomNumber.trim()) return 'Current room number is required.';
    if (!formData.requestedRoomNumber.trim()) return 'Requested room number is required.';
    if (!formData.reason.trim()) return 'Reason is required.';
    return '';
  };

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setErrorMessage('');
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      await createRoomChangeRequest(formData);
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to create request.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Ambient Background Glows */}
      <div className="absolute -top-24 -left-12 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="animate-fade-in">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Relocation Protocol</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Request <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Room Change</span>
            </h1>
            <p className="text-slate-500 font-medium mt-3 max-w-md">Initiate a formal structural transfer within the UNINEST housing network.</p>
          </div>
          
          <Link
            to="/rooms"
            className="group flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all shadow-xl"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Abort & Return
          </Link>
        </header>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Sidebar Info */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-md">
                 <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl w-fit mb-6">
                    <ShieldCheck className="text-indigo-400 w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-3">Validation Required</h3>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    All relocation requests undergo strict administrative review. Ensure your justification aligns with hostel safety and occupancy regulations.
                 </p>
              </div>

              <div className="p-8 border border-dashed border-slate-800 rounded-[2rem]">
                 <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Submission Ethics</h4>
                 <ul className="space-y-3">
                    {[
                        'Accuracy in Room Numbers',
                        'Clear Priority Definition',
                        'Valid Academic Justification'
                    ].map(item => (
                        <li key={item} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                           <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                           {item}
                        </li>
                    ))}
                 </ul>
              </div>
           </div>

           {/* Main Form Area */}
           <section className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none transition-opacity group-focus-within:opacity-100 opacity-50"></div>
              
              {!isSubmitted ? (
                <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRightLeft size={18} className="text-indigo-400" />
                    <h2 className="text-xl font-bold text-white tracking-tight uppercase text-xs tracking-widest">Protocol Intake Form</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput 
                        label="Full Legal Name" 
                        value={formData.studentName} 
                        onChange={(v) => updateField('studentName', v)}
                        placeholder="John Doe"
                    />
                    <FormInput 
                        label="Student ID Matrix" 
                        value={formData.studentId} 
                        onChange={(v) => updateField('studentId', v)}
                        placeholder="IT23860278"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput 
                        label="Current Allocation" 
                        value={formData.currentRoomNumber} 
                        onChange={(v) => updateField('currentRoomNumber', v)}
                        placeholder="e.g., A-101"
                    />
                    <FormInput 
                        label="Target Room" 
                        value={formData.requestedRoomNumber} 
                        onChange={(v) => updateField('requestedRoomNumber', v)}
                        placeholder="e.g., B-205"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Justification / Reason</label>
                    <textarea
                      rows={4}
                      value={formData.reason}
                      onChange={(e) => updateField('reason', e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:bg-slate-950 transition-all resize-none"
                      placeholder="Detail the requirement for relocation..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Relocation Priority</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['Low', 'Medium', 'High'].map(p => (
                            <button 
                                key={p}
                                onClick={() => updateField('priority', p)}
                                className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                    formData.priority === p 
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                                    : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-700'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-xs font-bold text-rose-400 animate-fade-in flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                        {errorMessage}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="w-full group inline-flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-6 py-4 text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSaving ? 'Processing Matrix...' : 'Broadcast Request'}
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center text-center space-y-6 animate-fade-in">
                   <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                      <ShieldCheck className="text-emerald-400 w-10 h-10" />
                   </div>
                   <div>
                       <h3 className="text-2xl font-black text-white mb-2">Transmission Secure</h3>
                       <p className="text-slate-500 text-sm font-medium max-w-sm">Your room change request has been successfully broadast to the central administration matrix.</p>
                   </div>
                   <button
                    onClick={resetForm}
                    className="px-8 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all shadow-xl"
                  >
                    Submit New Directive
                  </button>
                </div>
              )}
           </section>
        </div>
      </div>

      <style jsx="true">{`
        .animate-fade-in {
            animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const FormInput = ({ label, value, onChange, placeholder }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</label>
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-medium text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:bg-slate-950 transition-all"
            placeholder={placeholder}
        />
    </div>
);

export default RoomChangeRequestPage;