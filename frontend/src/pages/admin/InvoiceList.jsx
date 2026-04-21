import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, Search, Filter, Download, MoreHorizontal, ArrowUpRight, TrendingUp, CreditCard, Clock, ShieldCheck } from 'lucide-react';
import { getInvoices } from '../../services/paymentService';

function InvoiceList() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await getInvoices();
      setInvoices(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Partially Paid':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Unpaid':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0c10]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-x-0 -bottom-8 text-indigo-400 text-[10px] font-black tracking-widest text-center uppercase">Syncing ledger</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-10 animate-fade-in">

        {/* Header & Hero */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8 border-b border-slate-800/50">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Financial Control Unit</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight flex items-center gap-4">
              <CreditCard className="text-indigo-500 w-10 h-10 md:w-12 md:h-12" />
              Invoices <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Ledger</span>
            </h1>
            <p className="text-slate-500 font-medium mt-3 tracking-wide max-w-xl">Comprehensive audit trail for hostel revenue and student dues. Manage billing directives from a centralized matrix.</p>
          </div>

          <div className="flex items-center gap-3">
             <button
               onClick={() => navigate('/admin/invoice/create')}
               className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
             >
               <PlusCircle size={18} className="fill-white/20" />
               New Directive
             </button>
             <button className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl">
               <Download size={20} />
             </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Liquidity Pool" value={formatCurrency(invoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0))} icon={TrendingUp} color="indigo" />
            <StatCard title="Settled Assets" value={formatCurrency(invoices.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0))} icon={ShieldCheck} color="emerald" />
            <StatCard title="Active Receivables" value={formatCurrency(invoices.reduce((acc, curr) => acc + (curr.outstandingBalance || 0), 0))} icon={Clock} color="amber" />
            <StatCard title="Active Invoices" value={invoices.length} icon={FileText} color="sky" />
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-4 md:p-6 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center mb-8 shadow-2xl">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Query by Invoice ID or Student Entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 text-white text-sm font-bold rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-indigo-500/50 focus:bg-slate-950 transition-all placeholder:text-slate-700 font-sans"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all w-full md:w-auto justify-center">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Enhanced Table */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] shadow-2xl backdrop-blur-md overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-950/30">
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Archive Reference</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Entity</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Valuation</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Settled Amount</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Differential</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Matrix</th>
                  <th className="p-6 text-right"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/30">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <FileText size={48} className="text-slate-600" />
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Ledger Data Missing</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr 
                      key={inv._id} 
                      className="group/row hover:bg-indigo-500/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/invoice/${inv._id}`)}
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-950 rounded-lg group-hover/row:bg-indigo-500/20 transition-colors">
                            <FileText size={16} className="text-indigo-400" />
                           </div>
                           <span className="text-sm font-black text-white group-hover/row:text-indigo-400 transition-colors">#{inv.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="p-6 font-bold text-slate-300 text-sm">{inv.studentName}</td>
                      <td className="p-6 font-black text-white text-sm">{formatCurrency(inv.totalAmount)}</td>
                      <td className="p-6 font-bold text-emerald-400 text-sm">{formatCurrency(inv.amountPaid)}</td>
                      <td className="p-6 font-bold text-rose-400 text-sm">{formatCurrency(inv.outstandingBalance)}</td>
                      <td className="p-6">
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${getStatusStyle(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                         <div className="flex items-center justify-end gap-2 pr-2">
                           <button className="opactiy-0 group-hover/row:opacity-100 p-2 text-slate-500 hover:text-white transition-all bg-slate-900 rounded-lg border border-slate-800">
                             <ArrowUpRight size={14} />
                           </button>
                           <button className="p-2 text-slate-600 hover:text-indigo-400 transition-all">
                             <MoreHorizontal size={18} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0c10; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b; 
          border-radius: 10px;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
      indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5',
      emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
      amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5',
      sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20 shadow-sky-500/5'
  };

  return (
      <div className={`bg-slate-900/60 border border-slate-800 p-6 rounded-[2.5rem] flex items-center gap-6 hover:border-slate-700 transition-all duration-300 hover:scale-[1.02] shadow-2xl ${colors[color]}`}>
          <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <Icon size={28} />
          </div>
          <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">{title}</p>
              <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
          </div>
      </div>
  );
};

export default InvoiceList;