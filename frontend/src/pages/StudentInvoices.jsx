import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronRight, 
    Download, 
    DollarSign, 
    Calendar, 
    AlertCircle, 
    Receipt, 
    CreditCard, 
    Loader2, 
    History, 
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    X
} from 'lucide-react';
import { getInvoices, getStudentInvoices } from '../services/paymentService';
import { toast } from 'react-toastify';
import StudentNavbar from '../components/studentDashboard/StudentNavbar';

function StudentInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const userData = JSON.parse(userStr);
            setProfile(userData);
            fetchInvoices(userData._id || userData.id);
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    } else {
        fetchInvoices();
    }
  }, []);

  const fetchInvoices = async (studentId) => {
    try {
      setLoading(true);
      let response;
      if (studentId) {
        response = await getStudentInvoices(studentId);
      } else {
        response = await getInvoices();
      }
      
      const data = response.success ? response.data : (response.data || []);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to synchronize financial archives.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(amount || 0);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case 'Partially Paid':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]';
      case 'Overdue':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
    }
  };

  const handlePayNow = (invoice) => {
    if (invoice.outstandingBalance <= 0) {
      toast.info('This obligation has already been fully satisfied.');
      return;
    }
    navigate(`/payment-form/${invoice._id}`);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <StudentNavbar profile={profile} />
      
      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-10 animate-fade-in">
        
        {/* Header section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 mb-2">Financial Ledger Matrix</p>
                <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                    <Receipt className="text-indigo-500 w-10 h-10" />
                    My Invoices
                </h1>
                <p className="text-slate-500 font-medium mt-3 tracking-wide">Monitor and fulfill your hostel fee obligations through the secure portal.</p>
            </div>
            {invoices.length > 0 && (
                <div className="flex items-center gap-3 bg-slate-900 shadow-2xl p-2 rounded-2xl border border-slate-800">
                     <div className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Total Outstanding</span>
                        <span className="text-sm font-black text-white flex items-center gap-2">
                            <CreditCard size={14} className="text-indigo-400" />
                            {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.outstandingBalance || 0), 0))}
                        </span>
                    </div>
                </div>
            )}
        </header>

        {/* Stats Grid */}
        {invoices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Settled Transactions" value={invoices.filter(inv => inv.status === 'Paid').length} icon={CheckCircle2} color="emerald" />
                <StatCard title="Pending Obligations" value={invoices.filter(inv => inv.status !== 'Paid').length} icon={History} color="amber" />
                <StatCard title="Active Invoices" value={invoices.length} icon={Receipt} color="indigo" />
            </div>
        )}

        {/* Main Workspace */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-900/40 border border-dashed border-slate-800 rounded-[3rem]">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Synchronizing Master Financial Ledger</p>
            </div>
        ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-900/40 border border-dashed border-slate-800 rounded-[3rem] text-center">
                <ShieldCheck size={48} className="text-slate-800 mb-6" />
                <h3 className="text-xl font-bold text-slate-500 mb-2">Zero Financial Anomalies</h3>
                <p className="text-xs text-slate-700 font-bold uppercase tracking-widest leading-relaxed">No invoices have been synthesized for your account at this temporal juncture.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {invoices.map((invoice) => (
                    <div key={invoice._id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 lg:p-8 hover:border-slate-700 transition-all group relative overflow-hidden shadow-2xl backdrop-blur-md">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity"></div>
                        
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                            {/* Identifier Wing */}
                            <div className="flex items-center gap-6 w-full lg:w-auto">
                                <div className="p-4 bg-slate-950 rounded-[1.5rem] border border-slate-800 shadow-inner group-hover:scale-105 transition-transform">
                                    <Receipt className="text-slate-600 group-hover:text-indigo-400 transition-colors" size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black text-white tracking-tight uppercase">{invoice.invoiceNumber}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(invoice.status)}`}>
                                            {invoice.status}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {invoice.semester} • {invoice.academicYear}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Data Wing */}
                            <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-6 px-0 lg:px-10 border-y lg:border-y-0 lg:border-x border-slate-800/50 py-6 lg:py-0">
                                <InvoiceDataPoint label="Total Amount" value={formatCurrency(invoice.totalAmount)} />
                                <InvoiceDataPoint label="Satisfied" value={formatCurrency(invoice.amountPaid)} />
                                <InvoiceDataPoint 
                                    label="Outstanding" 
                                    value={formatCurrency(invoice.outstandingBalance)} 
                                    color={invoice.outstandingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'} 
                                />
                                <InvoiceDataPoint label="Due Date" value={formatDate(invoice.dueDate)} icon={Calendar} />
                            </div>

                            {/* Operation Wing */}
                            <div className="flex items-center gap-4 w-full lg:w-auto">
                                <button
                                    onClick={() => setSelectedInvoice(invoice)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-900 transition-all active:scale-95"
                                >
                                    Synthesize <ArrowRight size={14} />
                                </button>

                                {invoice.outstandingBalance > 0 && invoice.status !== 'Paid' && (
                                    <button
                                        onClick={() => handlePayNow(invoice)}
                                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/20 transition-all active:scale-95"
                                    >
                                        Settle Global <DollarSign size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
            <div className="fixed inset-0 bg-[#060b14]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-10">
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-4xl max-h-full overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col animate-scale-up">
                    
                    {/* Header */}
                    <div className="bg-indigo-600 p-8 flex items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-32 translate-x-32 pointer-events-none"></div>
                        <div className="relative z-10">
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Dossier Manifest</p>
                            <h2 className="text-2xl font-black text-white">{selectedInvoice.invoiceNumber}</h2>
                        </div>
                        <button
                            onClick={() => setSelectedInvoice(null)}
                            className="relative z-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all active:scale-90"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/50">
                            <ModalSummaryPoint label="Classification" value={selectedInvoice.status} style={getStatusStyle(selectedInvoice.status)} />
                            <ModalSummaryPoint label="Generation Date" value={formatDate(selectedInvoice.invoiceDate)} />
                            <ModalSummaryPoint label="Temporal Deadline" value={formatDate(selectedInvoice.dueDate)} color="text-rose-400" />
                            <ModalSummaryPoint label="Academic Year" value={selectedInvoice.academicYear} />
                        </div>

                        {/* Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <User size={14} className="text-indigo-400" /> Subject Logistics
                                </h3>
                                <div className="space-y-4 bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800">
                                    <DataRow label="Legal Name" value={selectedInvoice.studentName} />
                                    <DataRow label="Registry ID" value={selectedInvoice.studentId} />
                                    <DataRow label="Active Semester" value={selectedInvoice.semester || 'N/A'} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Receipt size={14} className="text-indigo-400" /> Expense Allocation
                                </h3>
                                <div className="space-y-4 bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800">
                                    {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                                        <DataRow key={idx} label={item.description} value={formatCurrency(item.amount)} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Final Balance */}
                        <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] p-8 md:p-10">
                            <div className="space-y-4">
                                <SummaryValue label="Gross Aggregate" value={formatCurrency(selectedInvoice.subtotal)} />
                                {selectedInvoice.discount > 0 && (
                                    <SummaryValue label="Institutional Discount" value={`- ${formatCurrency(selectedInvoice.discount)}`} color="text-indigo-400" />
                                )}
                                <div className="pt-6 border-t border-slate-800/50 mt-6">
                                    <SummaryValue label="Total Obligation" value={formatCurrency(selectedInvoice.totalAmount)} large white />
                                </div>
                                {selectedInvoice.amountPaid > 0 && (
                                    <SummaryValue label="Aggregate Satisfied" value={formatCurrency(selectedInvoice.amountPaid)} color="text-emerald-400" />
                                ) }
                                <div className="flex justify-between items-center bg-indigo-500 p-6 rounded-2xl mt-8 shadow-2xl shadow-indigo-900/30">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Net Outstanding Balance</span>
                                    <span className="text-2xl font-black text-white">{formatCurrency(selectedInvoice.outstandingBalance)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-slate-800/50 bg-slate-950/20 backdrop-blur-sm flex gap-4">
                        <button
                            onClick={() => setSelectedInvoice(null)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl transition-all active:scale-[0.98]"
                        >
                            Acknowledge & Close
                        </button>
                        {selectedInvoice.outstandingBalance > 0 && selectedInvoice.status !== 'Paid' && (
                            <button
                                onClick={() => {
                                    handlePayNow(selectedInvoice);
                                    setSelectedInvoice(null);
                                }}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-indigo-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                Initiate Gateway Settle
                                <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>

      <style jsx="true">{`
        .animate-scale-up {
            animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #1e293b; 
            border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

// ====== SUBCOMPONENTS ======

const StatCard = ({ title, value, icon: Icon, color }) => {
    const colors = {
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-2xl hover:border-slate-700 transition-colors">
            <div className={`p-4 rounded-2xl ${colors[color]} shadow-inner`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pb-1">{title}</p>
                <h3 className="text-3xl font-black text-white">{value}</h3>
            </div>
        </div>
    );
};

const InvoiceDataPoint = ({ label, value, color = "text-slate-200", icon: Icon }) => (
    <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5 leading-none">
            {Icon && <Icon size={10} />} {label}
        </p>
        <p className={`text-base font-black ${color}`}>{value}</p>
    </div>
);

const ModalSummaryPoint = ({ label, value, color = "text-slate-300", style = "" }) => (
    <div className="space-y-2">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</p>
        <div className={`font-black text-sm tracking-tight ${color} ${style} ${style ? 'px-3 py-1 rounded-lg inline-block' : ''}`}>
            {value}
        </div>
    </div>
);

const DataRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-white tracking-tight">{value}</span>
    </div>
);

const SummaryValue = ({ label, value, color = "text-white/70", large = false, white = false }) => (
    <div className="flex justify-between items-center">
        <span className={`${large ? 'text-[11px]' : 'text-[10px]'} font-black uppercase tracking-widest ${white ? 'text-white' : 'text-slate-500'}`}>{label}</span>
        <span className={`${large ? 'text-2xl' : 'text-lg'} font-black tracking-tight ${color}`}>{value}</span>
    </div>
);

export default StudentInvoices;