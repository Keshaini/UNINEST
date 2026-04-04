import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Plus
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
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to create request.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-orange-50 relative overflow-hidden">
      <div className="absolute -top-24 -left-12 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="absolute top-16 -right-20 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />

      <div className="relative max-w-3xl mx-auto px-4 py-8 md:px-8">
        <header className="rounded-3xl border border-white bg-white/85 backdrop-blur p-6 shadow-lg mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-700 font-bold">UNINEST</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800">Request Room Change</h1>
              <p className="text-sm text-slate-500 mt-1">Submit a request to change your current room.</p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/hostels"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Back to Rooms
              </Link>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white bg-white/90 p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRightLeft size={18} className="text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-800">Submit Your Request</h2>
          </div>

          {!isSubmitted ? (
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="block text-slate-500 mb-1">Student Name</span>
                <input
                  value={formData.studentName}
                  onChange={(e) => updateField('studentName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Your full name"
                />
              </label>

              <label className="block text-sm">
                <span className="block text-slate-500 mb-1">Student ID</span>
                <input
                  value={formData.studentId}
                  onChange={(e) => updateField('studentId', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Your student ID"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="block text-slate-500 mb-1">Current Room</span>
                  <input
                    value={formData.currentRoomNumber}
                    onChange={(e) => updateField('currentRoomNumber', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="e.g., 101"
                  />
                </label>

                <label className="block text-sm">
                  <span className="block text-slate-500 mb-1">Requested Room</span>
                  <input
                    value={formData.requestedRoomNumber}
                    onChange={(e) => updateField('requestedRoomNumber', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                    placeholder="e.g., 205"
                  />
                </label>
              </div>

              <label className="block text-sm">
                <span className="block text-slate-500 mb-1">Reason for Change</span>
                <textarea
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => updateField('reason', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Please explain why you need to change rooms..."
                />
              </label>

              <label className="block text-sm">
                <span className="block text-slate-500 mb-1">Priority</span>
                <select
                  value={formData.priority}
                  onChange={(e) => updateField('priority', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>

              {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}

              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700 disabled:bg-slate-400"
              >
                <Plus size={16} />
                {isSaving ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <h3 className="text-lg font-bold text-emerald-700">Request Submitted!</h3>
              <p className="text-sm text-emerald-600 mt-2">Your room change request has been submitted successfully. Our team will review it and get back to you soon.</p>
              <button
                onClick={() => {
                  resetForm();
                }}
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
              >
                Submit Another Request
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default RoomChangeRequestPage;