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
import { Link } from 'react-router-dom';
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

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField('imageUrl', typeof reader.result === 'string' ? reader.result : '');
      setErrorMessage('');
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
      roomNumber: formData.roomNumber.trim(),
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

    if (editingId === id) {
      resetForm();
    }
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-100 via-cyan-50 to-amber-50 text-slate-700">
      <div className="absolute -top-24 -left-12 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute top-24 -right-20 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:px-8">
        <header className="mb-6 rounded-3xl bg-white/85 backdrop-blur border border-white shadow-lg p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-700 font-bold">UNINEST Admin Portal</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800">Hostel Management System</h1>
              <p className="text-sm text-slate-500 mt-1">Create, update, and monitor hostels from one dashboard.</p>
            </div>

            <Link
              to="/hostels"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold"
            >
              Back to User View
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl bg-white/90 border border-white shadow-md p-4">
            <p className="text-xs uppercase text-slate-400 font-bold">Total Hostels</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{hostels.length}</p>
          </div>
          <div className="rounded-2xl bg-white/90 border border-white shadow-md p-4">
            <p className="text-xs uppercase text-slate-400 font-bold">Open / Full</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{openCount} / {fullCount}</p>
          </div>
          <div className="rounded-2xl bg-white/90 border border-white shadow-md p-4">
            <p className="text-xs uppercase text-slate-400 font-bold">Total Beds Available</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalBeds}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
          <div className="rounded-3xl bg-white/90 border border-white shadow-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={18} className="text-cyan-700" />
              <h2 className="font-bold text-lg text-slate-800">{editingId ? 'Edit Hostel' : 'Create Hostel'}</h2>
            </div>

            <div className="space-y-3">
              <label className="block text-sm">
                <span className="block text-slate-500 mb-1">Room Number / Code</span>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => updateField('roomNumber', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="block text-slate-500 mb-1">Hostel Name</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="block text-slate-500 mb-1">Location</span>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="block text-slate-500 mb-1">Hostel Image URL</span>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                  placeholder="https://example.com/hostel.jpg"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="block text-slate-500 mb-1">Or Upload Hostel Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-100 file:px-3 file:py-1.5 file:text-cyan-800 file:font-semibold"
                />
              </label>

              {formData.imageUrl && (
                <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Image Preview</p>
                  <img
                    src={formData.imageUrl}
                    alt="Hostel preview"
                    className="w-full h-36 object-cover rounded-xl"
                    onError={() => setErrorMessage('Image URL could not be loaded. Please check the link.')}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="block text-slate-500 mb-1">Monthly Rent</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="block text-sm">
                  <span className="block text-slate-500 mb-1">Beds</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.bedsAvailable}
                    onChange={(e) => updateField('bedsAvailable', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="block text-slate-500 mb-1">Status</span>
                  <select
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <option value="Open">Open</option>
                    <option value="Limited">Limited</option>
                    <option value="Full">Full</option>
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="block text-slate-500 mb-1">Hostel Type</span>
                  <select
                    value={formData.hostelType}
                    onChange={(e) => updateField('hostelType', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <option value="Boys Hostel">Boys Hostel</option>
                    <option value="Girls Hostel">Girls Hostel</option>
                    <option value="Mixed Hostel">Mixed Hostel</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm">
                <span className="block text-slate-500 mb-1">Max Residents / Room</span>
                <input
                  type="number"
                  min="1"
                  value={formData.maxResidentsPerRoom}
                  onChange={(e) => updateField('maxResidentsPerRoom', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="block text-slate-500 mb-1">Features (comma-separated)</span>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => updateField('featuresText', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.nearUniversity}
                    onChange={(e) => updateField('nearUniversity', e.target.checked)}
                    className="h-4 w-4"
                  />
                  Near University
                </label>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.mealPlanIncluded}
                    onChange={(e) => updateField('mealPlanIncluded', e.target.checked)}
                    className="h-4 w-4"
                  />
                  Meal Plan Included
                </label>
              </div>

              {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSaveHostel}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-white font-semibold hover:bg-cyan-700"
                >
                  {editingId ? <Save size={16} /> : <Plus size={16} />}
                  {isSaving ? 'Saving...' : editingId ? 'Update Hostel' : 'Create Hostel'}
                </button>

                {editingId && (
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-100"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/90 border border-white shadow-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-cyan-700" />
                <h2 className="font-bold text-lg text-slate-800">Hostel Inventory</h2>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search hostel or location"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="Limited">Limited</option>
                  <option value="Full">Full</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {isLoading && (
                <div className="rounded-2xl border border-slate-200 p-6 text-center text-slate-500">
                  Loading hostels from backend...
                </div>
              )}

              {filteredHostels.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  No hostels match your filters.
                </div>
              )}

              {!isLoading && filteredHostels.map((hostel) => (
                <article key={hostel.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={hostel.image || '/api/placeholder/400/250'}
                        alt={hostel.name}
                        className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                      <h3 className="font-bold text-slate-800">{hostel.name}</h3>
                      <p className="text-sm text-slate-500 inline-flex items-center gap-1">
                        <MapPin size={14} />
                        {hostel.location}
                      </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        hostel.status === 'Full'
                          ? 'bg-rose-100 text-rose-700'
                          : hostel.status === 'Limited'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {hostel.status || 'Open'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-slate-600">
                    <p className="inline-flex items-center gap-1">
                      <CircleDollarSign size={14} />
                      LKR {hostel.price.toLocaleString()}
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <BedDouble size={14} />
                      Beds: {hostel.bedsAvailable}
                    </p>
                    <p>Type: {hostel.hostelType || 'N/A'}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => startEdit(hostel)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold hover:bg-slate-100"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => removeHostel(hostel.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 text-rose-700 px-3 py-1.5 text-sm font-semibold hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminHostelManagementSystem;
