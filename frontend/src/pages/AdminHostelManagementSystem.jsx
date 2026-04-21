import React, { useEffect, useMemo, useState } from 'react';
import {
  BedDouble,
  Building2,
  CircleDollarSign,
  MapPin,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  X
} from 'lucide-react';
import { createHostel, deleteHostel, fetchHostels, updateHostel } from '../services/hostelApi';

const defaultForm = {
  roomNumber: '',
  name: '',
  location: '',
  imageUrl: '',
  price: '',
  bedsAvailable: '',
  status: 'Open',
  hostelType: 'Boys Hostel',
  maxResidentsPerRoom: '',
  nearUniversity: false,
  mealPlanIncluded: false,
  featuresText: ''
};

function AdminHostelManagementSystem() {
  const [hostels, setHostels] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadHostels = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await fetchHostels();
      setHostels(response);
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to load hostels from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHostels();
  }, []);

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setErrorMessage('');
  };

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (jpg, png, webp, etc).');
      return;
    }
    setErrorMessage('');
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField('imageUrl', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const parseFeatures = (text) =>
    text
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const validateForm = () => {
    if (!formData.name.trim()) return 'Hostel name is required.';
    if (!formData.location.trim()) return 'Location is required.';
    if (!formData.price || Number(formData.price) <= 0) return 'Monthly rent must be greater than 0.';
    if (!formData.bedsAvailable || Number(formData.bedsAvailable) < 0) return 'Beds available cannot be negative.';
    if (!formData.maxResidentsPerRoom || Number(formData.maxResidentsPerRoom) <= 0) {
      return 'Max residents per room must be greater than 0.';
    }
    return '';
  };

  const handleSaveHostel = async () => {
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const hostelInput = {
      roomNumber: formData.roomNumber.trim() || `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name.trim(),
      location: formData.location.trim(),
      image: formData.imageUrl.trim() || '/api/placeholder/400/250',
      price: Number(formData.price),
      bedsAvailable: Number(formData.bedsAvailable),
      status: formData.status,
      hostelType: formData.hostelType,
      maxResidentsPerRoom: Number(formData.maxResidentsPerRoom),
      nearUniversity: formData.nearUniversity,
      mealPlanIncluded: formData.mealPlanIncluded,
      features: parseFeatures(formData.featuresText),
      rating: 8.5,
      reviews: 0,
      stayPeriodLabel: 'Any'
    };

    try {
      setIsSaving(true);
      setErrorMessage('');
      if (editingId) {
        await updateHostel(editingId, hostelInput);
      } else {
        await createHostel(hostelInput);
      }
      await loadHostels();
      resetForm();
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to save hostel.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (hostel) => {
    setEditingId(hostel.id);
    setErrorMessage('');
    setFormData({
      roomNumber: hostel.roomNumber || '',
      name: hostel.name,
      location: hostel.location,
      imageUrl: hostel.image || '',
      price: String(hostel.price),
      bedsAvailable: String(hostel.bedsAvailable),
      status: hostel.status || 'Open',
      hostelType: hostel.hostelType || 'Boys Hostel',
      maxResidentsPerRoom: String(hostel.maxResidentsPerRoom || 1),
      nearUniversity: Boolean(hostel.nearUniversity),
      mealPlanIncluded: Boolean(hostel.mealPlanIncluded),
      featuresText: (hostel.features || []).join(', ')
    });
  };

  const removeHostel = async (id) => {
    const target = hostels.find((hostel) => hostel.id === id);
    if (!target) return;
    const approved = window.confirm(`Delete ${target.name}? This action cannot be undone.`);
    if (!approved) return;

    try {
      setErrorMessage('');
      await deleteHostel(id);
      await loadHostels();
    } catch (error) {
      setErrorMessage(error?.response?.data?.error || 'Failed to delete hostel.');
      return;
    }
    if (editingId === id) resetForm();
  };

  const filteredHostels = useMemo(() => {
    return hostels.filter((hostel) => {
      const matchesKeyword =
        keyword.trim().length === 0 ||
        hostel.name.toLowerCase().includes(keyword.trim().toLowerCase()) ||
        hostel.location.toLowerCase().includes(keyword.trim().toLowerCase());
      const matchesStatus = statusFilter === 'All' || (hostel.status || 'Open') === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [hostels, keyword, statusFilter]);

  const openCount = hostels.filter((hostel) => hostel.status === 'Open').length;
  const fullCount = hostels.filter((hostel) => hostel.status === 'Full').length;
  const totalBeds = hostels.reduce((sum, hostel) => sum + (hostel.bedsAvailable || 0), 0);

  const inputClass = "w-full rounded-xl bg-slate-900/50 border border-slate-700/50 px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none transition-colors backdrop-blur-sm";
  const selectClass = "w-full rounded-xl bg-slate-900/50 border border-slate-700/50 px-4 py-2.5 text-white focus:border-emerald-500/50 outline-none transition-colors backdrop-blur-sm [&>option]:bg-slate-800";

  return (
    <div className="w-full animate-fade-in font-sans text-slate-200 space-y-6">
      
      <header className="rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold">UNINEST Admin Portal</p>
            <h1 className="text-3xl font-black text-white mt-1">Hostel Management</h1>
            <p className="text-sm text-slate-400 mt-1">Create, update, and monitor hostels natively.</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-md p-5 backdrop-blur-md">
          <p className="text-xs uppercase text-slate-400 font-bold tracking-wider">Total Hostels</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">{hostels.length}</p>
        </div>
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-md p-5 backdrop-blur-md">
          <p className="text-xs uppercase text-slate-400 font-bold tracking-wider">Open / Full</p>
          <p className="text-3xl font-black text-white mt-2">{openCount} <span className="text-slate-500">/</span> {fullCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-md p-5 backdrop-blur-md">
          <p className="text-xs uppercase text-slate-400 font-bold tracking-wider">Total Beds Available</p>
          <p className="text-3xl font-black text-amber-400 mt-2">{totalBeds}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[400px_minmax(0,1fr)] gap-6">
        {/* Editor Form */}
        <div className="rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-lg p-6 h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
               <Building2 size={20} className="text-emerald-400" />
            </div>
            <h2 className="font-bold text-xl text-white">{editingId ? 'Edit Hostel Details' : 'Create New Hostel'}</h2>
          </div>

          <div className="space-y-4">
            <label className="block text-sm">
              <span className="block text-slate-400 mb-1.5 font-medium">Room Number / Code</span>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => updateField('roomNumber', e.target.value)}
                className={inputClass}
                placeholder="e.g. H-101"
              />
            </label>

            <label className="block text-sm">
              <span className="block text-slate-400 mb-1.5 font-medium">Hostel Name</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={inputClass}
                placeholder="Uninest Grand"
              />
            </label>

            <label className="block text-sm">
              <span className="block text-slate-400 mb-1.5 font-medium">Location</span>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className={inputClass}
                placeholder="Colombo City Center"
              />
            </label>

            {/* Image Upload */}
            <div className="block text-sm">
              <span className="block text-slate-400 mb-1.5 font-medium">Hostel Image</span>
              <label className="group flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-slate-600 hover:border-emerald-500/60 bg-slate-900/30 hover:bg-slate-900/50 cursor-pointer transition-all duration-200 overflow-hidden"
                style={{ minHeight: formData.imageUrl ? 0 : '120px' }}
              >
                {formData.imageUrl ? (
                  <div className="relative w-full">
                    <img
                      src={formData.imageUrl}
                      alt="Hostel preview"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <span className="text-white text-xs font-semibold">Click to change image</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-500 group-hover:text-emerald-400 transition-colors mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-slate-400 text-sm font-semibold group-hover:text-white transition-colors">Click to upload a hostel image</p>
                    <p className="text-slate-600 text-xs mt-1">JPG, PNG, WEBP up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => updateField('imageUrl', '')}
                  className="mt-2 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                >
                  ✕ Remove image
                </button>
              )}
            </div>


            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="block text-slate-400 mb-1.5 font-medium">Monthly Rent</span>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm">
                <span className="block text-slate-400 mb-1.5 font-medium">Beds Available</span>
                <input
                  type="number"
                  min="0"
                  value={formData.bedsAvailable}
                  onChange={(e) => updateField('bedsAvailable', e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="block text-slate-400 mb-1.5 font-medium">Status</span>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className={selectClass}
                >
                  <option value="Open">Open</option>
                  <option value="Limited">Limited</option>
                  <option value="Full">Full</option>
                </select>
              </label>

              <label className="block text-sm">
                <span className="block text-slate-400 mb-1.5 font-medium">Hostel Type</span>
                <select
                  value={formData.hostelType}
                  onChange={(e) => updateField('hostelType', e.target.value)}
                  className={selectClass}
                >
                  <option value="Boys Hostel">Boys Hostel</option>
                  <option value="Girls Hostel">Girls Hostel</option>
                  <option value="Mixed Hostel">Mixed Hostel</option>
                </select>
              </label>
            </div>

            <label className="block text-sm">
              <span className="block text-slate-400 mb-1.5 font-medium">Max Residents / Room</span>
              <input
                type="number"
                min="1"
                value={formData.maxResidentsPerRoom}
                onChange={(e) => updateField('maxResidentsPerRoom', e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className="block text-slate-400 mb-1.5 font-medium">Features (comma-separated)</span>
              <textarea
                rows={3}
                value={formData.featuresText}
                onChange={(e) => updateField('featuresText', e.target.value)}
                className={inputClass}
                placeholder="WiFi, AC, Laundry..."
              />
            </label>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="inline-flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.nearUniversity}
                  onChange={(e) => updateField('nearUniversity', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500/50 bg-slate-800"
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">Near University</span>
              </label>

              <label className="inline-flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.mealPlanIncluded}
                  onChange={(e) => updateField('mealPlanIncluded', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500/50 bg-slate-800"
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">Meal Plan</span>
              </label>
            </div>

            {errorMessage && (
              <div className="mt-4 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-slate-700/50">
              <button
                onClick={handleSaveHostel}
                disabled={isSaving}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600/90 px-6 py-3 text-white font-bold tracking-wide hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {isSaving ? 'Saving...' : editingId ? 'Update Hostel' : 'Create Hostel'}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-6 py-3 font-semibold hover:bg-slate-700/50 transition-colors"
                >
                  <X size={18} />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Directory Panel */}
        <div className="rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/50 shadow-lg p-6 flex flex-col h-[calc(100vh-140px)]">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-700/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <ShieldCheck size={20} className="text-blue-400" />
              </div>
              <h2 className="font-bold text-xl text-white">Live Inventory</h2>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-48 rounded-xl bg-slate-900/50 border border-slate-700/50 px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none placeholder:text-slate-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-32 rounded-xl bg-slate-900/50 border border-slate-700/50 px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none [&>option]:bg-slate-800"
              >
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="Limited">Limited</option>
                <option value="Full">Full</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-10">
            {isLoading && (
              <div className="rounded-xl border border-slate-700/50 p-8 text-center text-slate-400 bg-slate-900/20">
                Syncing with database...
              </div>
            )}

            {!isLoading && filteredHostels.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-600 p-12 text-center text-slate-500 bg-slate-900/20">
                No active hostels found.
              </div>
            )}

            {!isLoading && filteredHostels.map((hostel) => (
              <article key={hostel.id} className="group rounded-2xl border border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/80 p-5 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <img
                      src={hostel.image || '/api/placeholder/400/250'}
                      alt={hostel.name}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-slate-700"
                    />
                    <div className="flex flex-col justify-center">
                      <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">{hostel.name}</h3>
                      <p className="text-sm text-slate-400 inline-flex items-center gap-1.5 mt-1">
                        <MapPin size={14} className="text-slate-500" />
                        {hostel.location}
                      </p>
                      
                      <div className="mt-2.5 flex flex-wrap gap-3 text-xs font-medium text-slate-300">
                        <span className="inline-flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                          <CircleDollarSign size={13} className="text-emerald-500" />
                          LKR {hostel.price.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                          <BedDouble size={13} className="text-blue-400" />
                          {hostel.bedsAvailable} Beds
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold border ${
                        hostel.status === 'Full'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : hostel.status === 'Limited'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {hostel.status || 'Open'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-700/50 flex items-center justify-end gap-3">
                  <button
                    onClick={() => startEdit(hostel)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 hover:border-slate-500 transition-colors"
                  >
                    <Pencil size={15} className="text-emerald-400" />
                    Edit Details
                  </button>
                  <button
                    onClick={() => removeHostel(hostel.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-rose-900/50 text-rose-400 px-4 py-2 text-sm font-semibold hover:bg-rose-950/30 hover:border-rose-800 transition-colors"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminHostelManagementSystem;
