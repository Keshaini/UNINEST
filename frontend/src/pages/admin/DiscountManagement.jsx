import { useState, useEffect } from 'react';
import { 
    Plus, 
    Tag, 
    Edit, 
    Trash2, 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    Calendar, 
    Ticket, 
    Percent, 
    Coins, 
    Users, 
    Zap,
    ShieldCheck,
    ArrowUpRight,
    Trophy,
    UserCircle,
    Layers,
    Clock
} from 'lucide-react';
import { getDiscounts, createDiscount, updateDiscountStatus } from '../../services/paymentService';

function DiscountManagement() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    type: 'scholarship',
    percentage: '',
    fixedAmount: '',
    description: '',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: '',
    usageLimit: '',
    applicableCategories: []
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await getDiscounts();
      if (response.success) {
        setDiscounts(response.data);
      }
    } catch (err) {
      setError('Failed to synchronize discount database');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(category)
        ? prev.applicableCategories.filter(c => c !== category)
        : [...prev.applicableCategories, category]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const discountData = {
        ...formData,
        percentage: formData.percentage ? parseFloat(formData.percentage) : 0,
        fixedAmount: formData.fixedAmount ? parseFloat(formData.fixedAmount) : 0,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
      };

      const response = await createDiscount(discountData);
      
      if (response.success) {
        setSuccess('Privilege matrix updated successfully');
        setShowCreateModal(false);
        setFormData({
          studentId: '',
          type: 'scholarship',
          percentage: '',
          fixedAmount: '',
          description: '',
          validFrom: new Date().toISOString().split('T')[0],
          validTo: '',
          usageLimit: '',
          applicableCategories: []
        });
        fetchDiscounts();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authorization failed for discount creation');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await updateDiscountStatus(id, status);
      if (response.success) {
        setSuccess(`Protocol ${status.toLowerCase()} successful`);
        fetchDiscounts();
      }
    } catch (err) {
      setError('System rejection: failed to update status');
    }
  };

  const getTypeStyle = (type) => {
    const styles = {
      'scholarship': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'early_payment': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'sibling': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'merit': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'custom': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return styles[type] || styles.custom;
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Expired': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      'Disabled': 'bg-slate-800 text-slate-500 border-slate-700'
    };
    return styles[status] || styles.Disabled;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-x-0 -bottom-10 text-indigo-400 text-[10px] font-black tracking-widest text-center uppercase">Syncing Incentives</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-10 animate-fade-in">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-slate-800/50">
          <div className="animate-fade-in">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Benefit Configuration Unit</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight flex items-center gap-4">
              <Ticket className="text-indigo-500 w-10 h-10 md:w-12 md:h-12" />
              Discount <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Management</span>
            </h1>
            <p className="text-slate-500 font-medium mt-3 tracking-wide max-w-xl">Administer financial incentives and student privilege matrices. Define scholarship protocols and payment rewards.</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
          >
            <Plus size={18} className="fill-white/20" />
            New Privilege
          </button>
        </header>

        {/* Alerts Matrix */}
        {(error || success) && (
           <div className="grid grid-cols-1 gap-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl text-xs font-bold text-rose-400 animate-fade-in flex items-center gap-3">
                    <AlertCircle size={18} /> {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl text-xs font-bold text-emerald-400 animate-fade-in flex items-center gap-3">
                    <CheckCircle size={18} /> {success}
                </div>
              )}
           </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {discounts.map((discount) => (
            <div key={discount._id} className="group bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 rounded-[2.5rem] p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-md relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
              
              {/* Card Header */}
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                            <Tag className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h3 className="font-black text-white text-lg tracking-tight">{discount.discountCode}</h3>
                   </div>
                   <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getTypeStyle(discount.type)}`}>
                        {discount.type.replace('_', ' ')}
                   </span>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(discount.status)}`}>
                  {discount.status}
                </div>
              </div>

              {/* Data Metrics */}
              <div className="space-y-5 mb-8 relative z-10">
                <div className="flex justify-between items-center p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <Users size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entity</span>
                    </div>
                    <span className="text-xs font-black text-white">{discount.studentId}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl group-hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-3">
                        {discount.percentage > 0 ? <Percent size={14} className="text-indigo-400" /> : <Coins size={14} className="text-indigo-400" />}
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valuation</span>
                    </div>
                    <span className="text-lg font-black text-white">
                        {discount.percentage > 0 
                          ? `${discount.percentage}%`
                          : `LKR ${discount.fixedAmount.toLocaleString()}`
                        }
                    </span>
                </div>

                {discount.description && (
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-800 pl-4 py-1">
                    "{discount.description}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 pb-2">
                    <div className="p-3 bg-slate-950/20 border border-slate-800/50 rounded-xl">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Commenced</p>
                        <p className="text-[10px] font-black text-white">{new Date(discount.validFrom).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div className="p-3 bg-slate-950/20 border border-slate-800/50 rounded-xl">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Termination</p>
                        <p className="text-[10px] font-black text-white">
                            {discount.validTo ? new Date(discount.validTo).toLocaleDateString('en-GB') : 'Perpetual'}
                        </p>
                    </div>
                </div>

                {discount.usageLimit && (
                    <div className="relative pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Usage Saturation</span>
                            <span className="text-[9px] font-black text-indigo-400">{Math.round((discount.usageCount / discount.usageLimit) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                                style={{width: `${Math.min(100, (discount.usageCount / discount.usageLimit) * 100)}%`}}
                            ></div>
                        </div>
                    </div>
                )}
              </div>

              {/* Action Ribbon */}
              <div className="mt-auto pt-6 border-t border-slate-800/50 flex gap-3 relative z-10">
                {discount.status === 'Active' ? (
                  <button
                    onClick={() => handleStatusChange(discount._id, 'Disabled')}
                    className="flex-1 group/btn flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/50 transition-all"
                  >
                    <XCircle size={14} className="group-hover/btn:rotate-90 transition-transform" />
                    Archive protocol
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(discount._id, 'Active')}
                    className="flex-1 group/btn flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all"
                  >
                    <Zap size={14} className="group-hover/btn:scale-125 transition-transform" />
                    Restore system
                  </button>
                )}
                <button className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all">
                    <MoreHorizontalIcon />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Null State */}
        {discounts.length === 0 && (
          <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-[3rem] p-24 text-center backdrop-blur-md">
            <Ticket className="w-20 h-20 text-slate-800 mx-auto mb-6 opacity-50" />
            <h3 className="text-2xl font-black text-slate-600 mb-2">Zero Incentives Detected</h3>
            <p className="text-slate-700 font-bold uppercase tracking-widest text-xs mb-8">No privilege matrices have been initiated in the current sector.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/20"
            >
              Initiate Discovery
            </button>
          </div>
        )}

        {/* Create Privilege Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 z-[100] animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] max-w-2xl w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="p-8 md:p-12">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                            <Layers className="text-indigo-400 w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Construct <span className="text-indigo-500">Privilege</span></h2>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-3 text-slate-500 hover:text-white bg-slate-800/50 rounded-xl transition-all"
                    >
                      <XCircle className="w-6 h-6 text-slate-500 hover:text-rose-400" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModalInput label="Student ID Entity" name="studentId" value={formData.studentId} onChange={handleInputChange} placeholder="IT23860278" icon={UserCircle} required />
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Protocol Classification</label>
                          <div className="relative">
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                                required
                            >
                                <option value="scholarship">Scholarship Matrix</option>
                                <option value="early_payment">Early Liquidity Reward</option>
                                <option value="sibling">Kinship Allocation</option>
                                <option value="merit">Academic Merit</option>
                                <option value="custom">Manual Override</option>
                            </select>
                            <Trophy className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 pointer-events-none" />
                          </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModalInput label="Percentage (%)" type="number" name="percentage" value={formData.percentage} onChange={handleInputChange} placeholder="0" icon={Percent} />
                        <ModalInput label="Fixed Credit (LKR)" type="number" name="fixedAmount" value={formData.fixedAmount} onChange={handleInputChange} placeholder="0" icon={Coins} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Justification Brief</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all resize-none shadow-inner"
                        placeholder="Define the structural mandate for this discount..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModalInput label="Activation Date" type="date" name="validFrom" value={formData.validFrom} onChange={handleInputChange} icon={Calendar} />
                        <ModalInput label="Deactivation Date" type="date" name="validTo" value={formData.validTo} onChange={handleInputChange} icon={Clock} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <ModalInput label="Saturation Limit" type="number" name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} placeholder="Unlimited" icon={Zap} />
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Sector Application</label>
                            <div className="flex flex-wrap gap-2">
                                {['Room Fee', 'Depository', 'Utility'].map(category => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => handleCategoryChange(category)}
                                    className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                                        formData.applicableCategories.includes(category)
                                        ? 'bg-indigo-600 border-indigo-400 text-white'
                                        : 'bg-slate-950 border-slate-800 text-slate-600'
                                    }`}
                                >
                                    {category}
                                </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-10">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 px-8 py-5 border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 hover:text-white transition-all shadow-xl"
                      >
                        Abort Protocol
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-8 py-5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20"
                      >
                        Execute Directive
                      </button>
                    </div>
                  </form>
              </div>
            </div>
          </div>
        )}
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

// ====== MODAL HELPERS ======

const ModalInput = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</label>
        <div className="relative group/input">
            <Icon size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within/input:text-indigo-500 transition-colors" />
            <input
                {...props}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white placeholder:text-slate-800 outline-none focus:border-indigo-500/50 focus:bg-slate-950 transition-all"
            />
        </div>
    </div>
);

const MoreHorizontalIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
    </svg>
);

export default DiscountManagement;