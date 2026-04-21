import React, { useState, useEffect } from 'react';
import { 
    Download, 
    TrendingUp, 
    Calendar, 
    DollarSign, 
    FileText, 
    BarChart3, 
    Activity, 
    Filter, 
    ChevronRight, 
    Search, 
    Loader2,
    ShieldCheck,
    PieChart as PieChartIcon,
    ArrowDownToLine,
    RefreshCw
} from 'lucide-react';
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
    CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
    getFinancialSummary, 
    getPaymentAnalytics, 
    exportPayments, 
    exportInvoices 
} from '../../services/paymentService';
import { toast } from 'react-toastify';

function Reports() {
  const [financialData, setFinancialData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setRefreshing(true);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const [financialResponse, analyticsResponse] = await Promise.all([
        getFinancialSummary(params),
        getPaymentAnalytics()
      ]);

      if (financialResponse.success) setFinancialData(financialResponse.data);
      if (analyticsResponse.success) setAnalyticsData(analyticsResponse.data);
    } catch (err) {
      toast.error('Failed to synchronize global financial matrix.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      if (type === 'payments') {
        await exportPayments(params);
      } else if (type === 'invoices') {
        await exportInvoices(params);
      }
      toast.success(`${type.toUpperCase()} manifest exported successfully.`);
    } catch (err) {
      toast.error(`Export synthesis failure: ${type}`);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const statusChartData = financialData?.statusBreakdown?.map(item => ({
    name: item._id,
    value: item.count,
    amount: item.totalAmount
  })) || [];

  const paymentMethodData = financialData?.paymentMethods?.map(item => ({
    name: item._id,
    count: item.count,
    total: item.total
  })) || [];

  const monthlyTrendData = financialData?.monthlyTrend?.map(item => ({
    month: new Date(item._id.year, item._id.month - 1).toLocaleString('en-LK', {
        month: 'short',
        year: 'numeric'
    }),
    amount: item.totalPayments || 0,
    count: item.count || 0
})) || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-6" />
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Calibrating Financial Command Matrix</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
        {/* Header section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 mb-2">Central Analytics Module</p>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center gap-5">
                    <Activity className="text-indigo-500 w-12 h-12" />
                    Financial Intelligence
                </h1>
                <p className="text-slate-500 font-medium mt-3 tracking-wide">Real-time oversight of institutional cashflow and student financial integrity.</p>
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <button
                    onClick={() => handleExport('payments')}
                    disabled={exporting === 'payments'}
                    className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-all active:scale-95 disabled:opacity-50"
                >
                    {exporting === 'payments' ? <Loader2 className="animate-spin" size={14} /> : <ArrowDownToLine size={14} />}
                    Payments Manifest
                </button>
                <button
                    onClick={() => handleExport('invoices')}
                    disabled={exporting === 'invoices'}
                    className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/20 transition-all active:scale-95 disabled:opacity-50"
                >
                    {exporting === 'invoices' ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />}
                    Invoices Archive
                </button>
            </div>
        </header>

        {/* Global Filter Bar */}
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
            <div className="flex flex-col xl:flex-row gap-8 items-end">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <DateInput label="Temporal Start" value={dateRange.startDate} onChange={(val) => setDateRange(p => ({...p, startDate: val}))} />
                    <DateInput label="Temporal End" value={dateRange.endDate} onChange={(val) => setDateRange(p => ({...p, endDate: val}))} />
                </div>
                <button
                    onClick={fetchReports}
                    disabled={refreshing}
                    className="w-full xl:w-auto flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-[10px] uppercase tracking-widest px-10 py-4 rounded-2xl transition-all shadow-2xl active:scale-95"
                >
                    {refreshing ? <Loader2 className="animate-spin" size={16} /> : <Filter size={16} />}
                    Execute Filter
                </button>
            </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <MetricCard title="Gross Billed" value={formatCurrency(financialData?.summary?.totalBilled)} icon={FileText} trend="+12.5%" color="indigo" />
            <MetricCard title="Global Collected" value={formatCurrency(financialData?.summary?.totalPaid)} icon={DollarSign} trend="+8.2%" color="emerald" />
            <MetricCard title="Net Outstanding" value={formatCurrency(financialData?.summary?.totalOutstanding)} icon={TrendingUp} trend="-4.1%" color="rose" />
            <MetricCard title="Efficiency Rate" value={`${financialData?.summary?.totalBilled > 0 ? ((financialData?.summary?.totalPaid / financialData?.summary?.totalBilled) * 100).toFixed(1) : 0}%`} icon={BarChart3} trend="Stable" color="amber" />
        </div>

        {/* Analytics Visualization Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-3xl flex flex-col group">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                            <Activity className="text-indigo-500" size={24} />
                            Payment Velocity
                        </h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Monthly collection synthesis</p>
                    </div>
                </div>
                <div className="flex-1 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyTrendData}>
                            <defs>
                                <linearGradient id="comp-colorAmt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                            <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => `LKR ${val/1000}k`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '16px' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ color: '#94A3B8', fontSize: '10px', textTransform: 'uppercase' }}
                                formatter={(val) => [formatCurrency(val), 'Volume']}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#comp-colorAmt)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-3xl">
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3 mb-10">
                    <PieChartIcon className="text-amber-500" size={24} />
                    Status Quo
                </h3>
                <div className="h-[300px] mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusChartData}
                                cx="50%" cy="50%"
                                innerRadius={80} outerRadius={110}
                                paddingAngle={8}
                                dataKey="value"
                            >
                                {statusChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '16px' }}
                                itemStyle={{ color: '#F1F5F9', fontWeight: 'bold', fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-4 text-xs">
                    {statusChartData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                <span className="font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                            </div>
                            <span className="font-black text-white">{item.value} units</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-12 grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-3xl space-y-8">
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                        <TrendingUp className="text-emerald-500" size={24} />
                        Efficiency Analytics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnalyticsChip label="Avg Settle Time" value={`${analyticsData?.paymentTiming?.avgDays?.toFixed(1) || 0} Days`} color="indigo" />
                        <AnalyticsChip label="Peak Latency" value={`${analyticsData?.paymentTiming?.maxDays?.toFixed(0) || 0} Days`} color="rose" />
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Gateway Distribution Intensity</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {paymentMethodData.map((item, idx) => (
                                <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50 flex flex-col items-center gap-2 group hover:border-indigo-500/50 transition-all">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">{item.name}</span>
                                    <span className="text-xl font-black text-white">{item.count}</span>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{formatCurrency(item.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-4 lg:p-10 shadow-3xl overflow-hidden">
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3 mb-8 ml-6 mt-6 lg:m-0 lg:mb-10">
                        <ShieldCheck className="text-indigo-500" size={24} />
                        Global Financial Leaders
                    </h3>
                    <div className="overflow-x-auto px-6 lg:p-0">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Elite Index</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Aggregate Contribution</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Volume</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {analyticsData?.topStudents?.map((student, index) => (
                                    <tr key={index} className="group hover:bg-slate-950/40 transition-all">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 whitespace-nowrap">0{index + 1}</span>
                                                <span className="text-sm font-black text-slate-200 group-hover:text-white transition-colors">{student._id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-300 transition-colors whitespace-nowrap">{formatCurrency(student.totalPaid)}</td>
                                        <td className="px-6 py-5 text-right text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-indigo-400 whitespace-nowrap">{student.paymentCount} Trans</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

const DateInput = ({ label, value, onChange }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 leading-none">{label}</label>
        <div className="relative group">
            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-950/30 border border-slate-800/50 rounded-2xl pl-16 pr-6 py-4 text-xs font-black text-white outline-none focus:border-indigo-500/40 focus:bg-slate-950 transition-all cursor-pointer"
            />
        </div>
    </div>
);

const MetricCard = ({ title, value, icon: Icon, trend, color }) => {
    const colorMap = {
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    };
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl group hover:border-slate-700 transition-all relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -translate-y-16 translate-x-16 bg-current ${colorMap[color].split(' ')[0]}`}></div>
            <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-2xl shadow-inner ${colorMap[color]}`}>
                        <Icon size={24} />
                    </div>
                    <span className={`text-[9px] font-black px-3 py-1 bg-slate-950 rounded-lg border border-slate-800/50 uppercase tracking-widest whitespace-nowrap ${trend.startsWith('+') ? 'text-emerald-500' : trend.startsWith('-') ? 'text-rose-500' : 'text-slate-500'}`}>
                        {trend}
                    </span>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
                    <h4 className="text-3xl font-black text-white tracking-tight">{value}</h4>
                </div>
            </div>
        </div>
    );
};

const AnalyticsChip = ({ label, value, color }) => {
    const colorMap = {
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400'
    };
    return (
        <div className={`p-6 rounded-[2rem] border shadow-inner flex flex-col gap-2 ${colorMap[color]}`}>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">{label}</span>
            <span className="text-2xl font-black">{value}</span>
        </div>
    );
};

export default Reports;