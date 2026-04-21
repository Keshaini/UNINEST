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
  X,
  Search,
  Filter,
  Loader2,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  AlertCircle,
  Activity,
  Users,
  RefreshCw
} from 'lucide-react';
import { createHostel, deleteHostel, fetchHostels, updateHostel } from '../services/hostelApi';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/common/ConfirmationModal';

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

  // Modal State
  const [modal, setModal] = useState({
      isOpen: false,
      hostelId: null,
      hostelName: ''
  });

  const loadHostels = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await fetchHostels();
      setHostels(response);
    } catch (error) {
      toast.error('Failed to synchronize global hostel registry.');
      setErrorMessage(error?.response?.data?.error || 'Database synchronization failure.');
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
        toast.warning('Invalid file architecture. Image required.');
        return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField('imageUrl', reader.result);
      toast.success('Visual asset synthesized successfully.');
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
      toast.error(validationError);
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
        toast.success('Hostel parameters updated & broadcasted.');
      } else {
        await createHostel(hostelInput);
        toast.success('New hostel entity synthesized successfully.');
      }
      await loadHostels();
      resetForm();
    } catch (error) {
      toast.error('Entity synthesis failure detected.');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmRemoval = (id, name) => {
    setModal({ isOpen: true, hostelId: id, hostelName: name });
  };

  const handleRemoveHostel = async () => {
    const id = modal.hostelId;
    try {
      setErrorMessage('');
      await deleteHostel(id);
      toast.success(`${modal.hostelName} entity de-materialized successfully.`);
      await loadHostels();
    } catch (error) {
      toast.error('Manifest deletion failure.');
      setErrorMessage(error?.response?.data?.error || 'Deletion failed.');
    } finally {
      setModal({ isOpen: false, hostelId: null, hostelName: '' });
      if (editingId === id) resetForm();
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

  const inputClass = "w-full rounded-2xl bg-slate-950/40 border border-slate-800 px-5 py-3.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600 font-bold";
  const selectClass = "w-full rounded-2xl bg-slate-950/40 border border-slate-800 px-5 py-3.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-all cursor-pointer font-bold [&>option]:bg-slate-900";

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 p-6 lg:p-10 animate-fade-in selection:bg-emerald-500/30">
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* Header section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-2">Central Management Module</p>
                <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                    <Building2 className="text-emerald-500 w-10 h-10" />
                    Hostel Architecture
                </h1>
                <p className="text-slate-500 font-medium mt-3 tracking-wide">Synthesize, update, and regulate institutional housing entities.</p>
            </div>
            <div className="flex gap-4">
                <div className="bg-slate-950/50 px-6 py-4 rounded-2xl border border-slate-800 flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Global Index</span>
                    <span className="text-2xl font-black text-white mt-1">{hostels.length}</span>
                </div>
            </div>
        </header>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <MetricCard title="Operational Assets" value={openCount} sub="Open Status" icon={Building2} color="emerald" />
            <MetricCard title="Full Occupancy" value={fullCount} sub="Maximum Capacity" icon={ShieldCheck} color="rose" />
            <MetricCard title="Global Bed Pool" value={totalBeds} sub="Total Available" icon={BedDouble} color="amber" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[450px_minmax(0,1fr)] gap-8 lg:gap-12">
            
            {/* Editor Block */}
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-3xl h-fit sticky top-10 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
                
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-4 mb-10 pb-6 border-b border-slate-800">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        {editingId ? <Pencil size={20} className="text-emerald-400" /> : <Plus size={20} className="text-emerald-400" />}
                    </div>
                    {editingId ? 'Edit Profile' : 'Synthesize Entity'}
                </h3>

                <div className="space-y-6 relative z-10">
                    <Field label="Unique Identifier" icon={Info}>
                        <input type="text" value={formData.roomNumber} onChange={(e) => updateField('roomNumber', e.target.value)} className={inputClass} placeholder="e.g. ALPHA-01" />
                    </Field>

                    <Field label="Entity Name" icon={Building2}>
                        <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass} placeholder="Uninest Grand Suite" />
                    </Field>

                    <Field label="Temporal Location" icon={MapPin}>
                        <input type="text" value={formData.location} onChange={(e) => updateField('location', e.target.value)} className={inputClass} placeholder="Main Campus Zone" />
                    </Field>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visual Asset</label>
                        <label className="group relative flex flex-col items-center justify-center w-full h-48 rounded-[2rem] border-2 border-dashed border-slate-700/50 hover:border-emerald-500/40 bg-slate-950/30 hover:bg-slate-950/50 overflow-hidden transition-all cursor-pointer">
                            {formData.imageUrl ? (
                                <>
                                    <img src={formData.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Preview" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                        <RefreshCw size={24} className="text-white animate-spin-slow" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Binary</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                                        <Plus className="text-slate-600" size={24} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload 400x250 Raster</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Field label="Monthly Premium" icon={CircleDollarSign}>
                            <input type="number" value={formData.price} onChange={(e) => updateField('price', e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Bed Matrix" icon={BedDouble}>
                            <input type="number" value={formData.bedsAvailable} onChange={(e) => updateField('bedsAvailable', e.target.value)} className={inputClass} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Field label="Status Logic" icon={Activity}>
                            <select value={formData.status} onChange={(e) => updateField('status', e.target.value)} className={selectClass}>
                                <option value="Open">Open</option>
                                <option value="Limited">Limited</option>
                                <option value="Full">Full</option>
                            </select>
                        </Field>
                        <Field label="Target Demographic" icon={Users}>
                            <select value={formData.hostelType} onChange={(e) => updateField('hostelType', e.target.value)} className={selectClass}>
                                <option value="Boys Hostel">Boys Hostel</option>
                                <option value="Girls Hostel">Girls Hostel</option>
                                <option value="Mixed Hostel">Mixed Hostel</option>
                            </select>
                        </Field>
                    </div>

                    <Field label="Features (Comma Array)" icon={Sparkles}>
                        <textarea rows={3} value={formData.featuresText} onChange={(e) => updateField('featuresText', e.target.value)} className={`${inputClass} resize-none`} placeholder="WiFi, A/C, Bio-metric..." />
                    </Field>

                    <div className="flex gap-4 pt-6 border-t border-slate-800">
                        <button
                            onClick={handleSaveHostel}
                            disabled={isSaving}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : editingId ? <Save size={16} /> : <Plus size={16} />}
                            {editingId ? 'Push Updates' : 'Commit Entity'}
                        </button>
                        {editingId && (
                            <button
                                onClick={resetForm}
                                className="bg-slate-950 border border-slate-800 px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all active:scale-95"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Inventory Registry */}
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-4 lg:p-10 shadow-3xl flex flex-col h-[calc(100vh-140px)] sticky top-10">
                <div className="flex flex-wrap items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <ShieldCheck className="text-indigo-400" size={20} />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase">Registry Node</h3>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-64">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={16} />
                            <input type="text" placeholder="Search architecture..." value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-14 pr-5 py-3 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-emerald-500/50" />
                        </div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-950/40 border border-slate-800 rounded-2xl px-5 py-3 text-[10px] font-black text-white uppercase tracking-widest outline-none cursor-pointer">
                            <option value="All">All Nodes</option>
                            <option value="Open">Status: Open</option>
                            <option value="Limited">Status: Ltd</option>
                            <option value="Full">Status: Full</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar pb-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-slate-950/20 rounded-[2rem] border border-dashed border-slate-800">
                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Synchronizing Master Registry</p>
                        </div>
                    ) : filteredHostels.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-slate-950/20 rounded-[2rem] border border-dashed border-slate-800 text-center px-10">
                            <Search className="w-12 h-12 text-slate-800 mb-4" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Query returned zero valid sectors.</p>
                        </div>
                    ) : filteredHostels.map((hostel) => (
                        <article key={hostel.id} className="group bg-slate-950/40 border border-slate-800/80 rounded-[2.5rem] p-6 lg:p-10 hover:border-slate-700 transition-all shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
                            
                            <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative z-10">
                                <div className="w-full md:w-48 xl:w-56 h-48 lg:h-56 rounded-[2rem] overflow-hidden border border-slate-800 flex-shrink-0">
                                    <img src={hostel.image || '/api/placeholder/400/250'} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt={hostel.name} />
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-2">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors leading-none">{hostel.name}</h4>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3 flex items-center gap-2">
                                                    <MapPin size={12} className="text-emerald-500" /> {hostel.location}
                                                </p>
                                            </div>
                                            <StatusBadge status={hostel.status} />
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-2">
                                            <InfoMetric label="Lease" value={`LKR ${hostel.price.toLocaleString()}`} icon={CircleDollarSign} />
                                            <InfoMetric label="Pool" value={`${hostel.bedsAvailable} Units`} icon={BedDouble} />
                                            <InfoMetric label="Class" value={hostel.hostelType} icon={Users} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-slate-800">
                                        <button onClick={() => startEdit(hostel)} className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all active:scale-95">
                                            <Pencil size={14} className="text-emerald-500" />
                                            Calibrate
                                        </button>
                                        <button onClick={() => confirmRemoval(hostel.id, hostel.name)} className="flex items-center justify-center p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, hostelId: null, hostelName: '' })}
        onConfirm={handleRemoveHostel}
        title="Terminal Deletion Process"
        message={`Are you certain you wish to de-materialize the ${modal.hostelName} entity? Access to associated data will be permanently revoked across the network.`}
        type="danger"
      />
    </div>
  );
}

// ====== SUBCOMPONENTS ======

const MetricCard = ({ title, value, sub, icon: Icon, color }) => {
    const colors = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    };
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -translate-y-16 translate-x-16 bg-current ${colors[color].split(' ')[0]}`}></div>
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5 leading-none">{title}</p>
                    <h4 className="text-4xl font-black text-white tracking-tighter mb-1 leading-none">{value}</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{sub}</p>
                </div>
                <div className={`p-4 rounded-2xl shadow-inner ${colors[color]}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};

const Field = ({ label, icon: Icon, children }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Icon size={12} className="text-slate-600" /> {label}
        </label>
        {children}
    </div>
);

const InfoMetric = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2.5 rounded-xl border border-slate-800/80 group-hover:border-slate-700 transition-colors">
        <Icon size={13} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
        <div className="flex flex-col leading-none">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mb-1">{label}</span>
            <span className="text-xs font-black text-slate-200">{value}</span>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const s = status || 'Open';
    const style = s === 'Full' 
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
        : s === 'Limited' 
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

    return <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${style}`}>{s}</span>;
};

export default AdminHostelManagementSystem;
