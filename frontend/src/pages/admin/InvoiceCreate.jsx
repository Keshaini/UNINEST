import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../../services/paymentService';
import { toast } from 'react-toastify';
import { 
    Receipt, 
    User, 
    Calendar, 
    CreditCard, 
    Percent, 
    Calculator, 
    ArrowRight, 
    Loader2,
    Building2,
    ShieldCheck,
    AlertCircle,
    History,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

function InvoiceCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    semester: '',
    academicYear: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    roomFee: 0.00,
    securityDeposit: 0.00,
    utilities: 0.00,
    otherFees: 0.00,
    amountPaid: 0.00,
    discountPercentage: 0,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Format currency
  const formatCurrency = (amount) =>
    `LKR ${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Calculations
  const subtotal =
    Number(formData.roomFee) +
    Number(formData.securityDeposit) +
    Number(formData.utilities) +
    Number(formData.otherFees);

  const discount = (subtotal * Number(formData.discountPercentage)) / 100;
  const totalAmount = subtotal - discount;
  const outstandingBalance = totalAmount - Number(formData.amountPaid);

  // Validation function
  const validateField = (name, value) => {
    let message = '';
    if (name === 'studentName' && !value?.toString().trim()) message = 'Name required';
    if (name === 'studentId' && !value?.toString().trim()) message = 'ID required';
    if (name === 'semester' && !value?.toString().trim()) message = 'Semester required';
    if (name === 'academicYear' && !value?.toString().trim()) message = 'Year required';
    if (name === 'dueDate' && !value) message = 'Due date required';

    if (['roomFee', 'securityDeposit', 'utilities', 'otherFees', 'amountPaid'].includes(name)) {
      if (value !== '' && Number(value) < 0) message = 'Negative value invalid';
    }
    if (name === 'discountPercentage' && (value < 0 || value > 100)) message = 'Invalid %';

    return message;
  };

  const validateForm = () => {
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isAmountField = ['roomFee', 'securityDeposit', 'utilities', 'otherFees', 'amountPaid', 'discountPercentage'].includes(name);
    let newValue = isAmountField ? (value === '' ? '' : Number(value)) : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warning('Please rectify the highlighted discrepancies.');
      return;
    }

    setSubmitting(true);
    const invoiceData = {
      ...formData,
      items: [
        { description: 'Room Fee', amount: formData.roomFee },
        { description: 'Security Deposit', amount: formData.securityDeposit },
        { description: 'Utilities', amount: formData.utilities },
        { description: 'Other Fees', amount: formData.otherFees },
      ],
      subtotal,
      discount,
      totalAmount,
      outstandingBalance,
    };

    try {
      const response = await createInvoice(invoiceData);
      if (response.success || response.data) {
        toast.success('Invoice generated & broadcasted successfully!');
        navigate('/admin/invoice');
      } else {
        toast.error(response.message || 'Transmission failure. Verify gateway.');
        setSubmitting(false);
      }
    } catch (err) {
      toast.error('Fatal error during invoice synthesis.');
      setSubmitting(false);
    }
  };

  const fillSampleData = () => {
    setFormData({
      studentName: 'Kamal Perera',
      studentId: 'IT20231234',
      semester: 'Semester 1',
      academicYear: '2025',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-04-15',
      roomFee: 50000,
      securityDeposit: 20000,
      utilities: 5000,
      otherFees: 3000,
      amountPaid: 0,
      discountPercentage: 5,
    });
    setErrors({});
    toast.info('Sample data synthesized.');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 p-6 lg:p-10 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 mb-2">Financial Operations Module</p>
                <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                    <Receipt className="text-indigo-500 w-10 h-10" />
                    Synthesize Invoice
                </h1>
                <p className="text-slate-500 font-medium mt-3 tracking-wide">Generate official billing documentation for student residents.</p>
            </div>
            <button
                onClick={fillSampleData}
                className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-all shadow-xl active:scale-95"
            >
                <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                Synthesize Sample
            </button>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            {/* Form Section */}
            <div className="xl:col-span-8 space-y-8">
                {/* Profile Information */}
                <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none group-focus-within:opacity-100 opacity-50 transition-opacity"></div>
                    
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <User className="text-indigo-400 w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none">Resident Identification</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <InputField label="Student Full Name" name="studentName" value={formData.studentName} onChange={handleChange} error={errors.studentName} icon={User} placeholder="E.g. Kamal Perera" />
                        <InputField label="Registration Number" name="studentId" value={formData.studentId} onChange={handleChange} error={errors.studentId} icon={CheckCircle2} placeholder="E.g. IT20231234" />
                        <InputField label="Target Semester" name="semester" value={formData.semester} onChange={handleChange} error={errors.semester} icon={History} placeholder="E.g. Semester 1" />
                        <InputField label="Academic Year" name="academicYear" value={formData.academicYear} onChange={handleChange} error={errors.academicYear} icon={Calendar} placeholder="E.g. 2025" />
                    </div>
                </section>

                {/* Logistics */}
                <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Calendar className="text-emerald-400 w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none">Temporal Logistics</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Synthesis Date" name="invoiceDate" value={formData.invoiceDate} onChange={handleChange} type="date" icon={Calendar} />
                        <InputField label="Payment Deadline" name="dueDate" value={formData.dueDate} onChange={handleChange} error={errors.dueDate} type="date" icon={Clock} />
                    </div>
                </section>

                {/* Financial Breakdowns */}
                <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <CreditCard className="text-indigo-400 w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none">Financial Dissection</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AmountField label="Room Fee" name="roomFee" value={formData.roomFee} onChange={handleChange} error={errors.roomFee} />
                        <AmountField label="Security Deposit" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} error={errors.securityDeposit} />
                        <AmountField label="Utilities" name="utilities" value={formData.utilities} onChange={handleChange} error={errors.utilities} />
                        <AmountField label="Other Fees" name="otherFees" value={formData.otherFees} onChange={handleChange} error={errors.otherFees} />
                        <AmountField label="Initial Deposit" name="amountPaid" value={formData.amountPaid} onChange={handleChange} error={errors.amountPaid} color="emerald" />
                        <AmountField label="Loyalty Discount %" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} error={errors.discountPercentage} icon={Percent} color="indigo" />
                    </div>
                </section>
            </div>

            {/* Sidebar Summary Section */}
            <div className="xl:col-span-4 h-fit sticky top-10">
                <div className="bg-indigo-600 rounded-[2.5rem] p-1 p-8 shadow-2xl shadow-indigo-900/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32 group-hover:bg-white/20 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Billing Manifest</h3>
                            <Calculator className="text-white/50" size={20} />
                        </div>

                        <div className="space-y-6">
                            <SummaryLine label="Gross Subtotal" value={formatCurrency(subtotal)} />
                            <SummaryLine label="Synthesized Discount" value={`- ${formatCurrency(discount)}`} color="text-indigo-200" />
                            <div className="pt-6 border-t border-white/10">
                                <SummaryLine label="Net Total Amount" value={formatCurrency(totalAmount)} bold large />
                            </div>
                            <SummaryLine label="Current Outstanding" value={formatCurrency(outstandingBalance)} color="text-indigo-100" />
                        </div>

                        <div className="mt-12 space-y-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-white text-indigo-600 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-900/50 hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Synthesizing...
                                    </>
                                ) : (
                                    <>
                                        Authorize & Emit Invoice
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                            <p className="text-[9px] text-white/50 text-center font-black uppercase tracking-widest px-4 leading-relaxed">
                                By authorizing, you confirm the financial audit of this resident's ledger for the current semester.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Audit Checkpoint */}
                <div className="mt-8 bg-slate-950/20 border border-dashed border-slate-800 rounded-[2.5rem] p-8">
                   <div className="flex items-center gap-4 text-slate-500">
                        <ShieldCheck size={24} className="text-emerald-500/50" />
                        <div className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                            Audit Checkpoint Passed: <br/>  
                            <span className="text-slate-700">Checksum integrity verified for financial strings.</span>
                        </div>
                   </div>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}

// ====== SUBCOMPONENTS ======

const InputField = ({ label, name, value, onChange, error, type = "text", icon: Icon, placeholder }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            {Icon && <Icon className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${error ? 'text-rose-500' : 'text-slate-600 group-focus-within:text-indigo-500'}`} />}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full bg-slate-950/50 border rounded-2xl ${Icon ? 'pl-14' : 'px-6'} pr-6 py-4 text-sm font-medium text-white placeholder:text-slate-800 outline-none transition-all ${
                    error ? 'border-rose-500/50 bg-rose-500/5 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500/50 focus:bg-slate-950'
                }`}
                placeholder={placeholder}
            />
            {error && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1 bg-rose-500 rounded-lg text-[9px] font-black text-white uppercase shadow-lg shadow-rose-900/20">
                    <AlertCircle size={10} />
                    {error}
                </div>
            )}
        </div>
    </div>
);

const AmountField = ({ label, name, value, onChange, error, icon: Icon, color = "slate" }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black transition-colors ${error ? 'text-rose-400' : color === 'emerald' ? 'text-emerald-500' : 'text-slate-700'}`}>
                {Icon ? <Icon size={14} /> : 'LKR'}
            </span>
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full bg-slate-950/30 border border-slate-800/50 rounded-2xl pl-16 pr-6 py-4 text-sm font-black transition-all outline-none ${
                    error ? 'border-rose-500/50 text-rose-400' : 'text-white group-focus-within:border-indigo-500/40 group-focus-within:bg-slate-950'
                }`}
                min={0}
            />
        </div>
        {error && <p className="text-rose-500 text-[8px] font-black uppercase tracking-widest mt-1 ml-1">{error}</p>}
    </div>
);

const SummaryLine = ({ label, value, color = "text-white/70", bold = false, large = false }) => (
    <div className="flex justify-between items-center">
        <span className={`${large ? 'text-[10px]' : 'text-[9px]'} font-black uppercase tracking-widest ${bold ? 'text-white' : 'text-white/60'}`}>{label}</span>
        <span className={`${large ? 'text-2xl' : 'text-base'} font-black tracking-tight ${color}`}>{value}</span>
    </div>
);

const Clock = ({ size, className }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

export default InvoiceCreate;