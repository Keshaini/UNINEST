import { useState, useEffect } from 'react';
import { Download, TrendingUp, DollarSign, FileText, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  getFinancialSummary,
  getPaymentAnalytics,
  exportPayments,
  exportInvoices
} from '../../services/paymentService';

function Reports() {
  const [financialData, setFinancialData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { ...dateRange };

      const [financialRes, analyticsRes] = await Promise.all([
        getFinancialSummary(params),
        getPaymentAnalytics()
      ]);

      if (financialRes.success) setFinancialData(financialRes.data);
      if (analyticsRes.success) setAnalyticsData(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const params = { ...dateRange };
      if (type === 'payments') await exportPayments(params);
      else await exportInvoices(params);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);

  const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444'];

  const monthlyTrendData = financialData?.monthlyTrend?.map(item => ({
    month: new Date(item._id.year, item._id.month - 1).toLocaleString('en-LK', {
      month: 'short', year: 'numeric'
    }),
    amount: item.totalPayments || 0
  })) || [];

  const statusChartData = financialData?.statusBreakdown?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const paymentMethodData = financialData?.paymentMethods || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-indigo-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c10] via-[#0f172a] to-[#020617] text-gray-300 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Financial Reports</h1>
          <p className="text-gray-400">Billing & payment analytics</p>
        </div>

        {/* Filter */}
        <div className="bg-gray-800/70 backdrop-blur-md border border-gray-700 p-6 rounded-xl mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <input
              type="date"
              className="bg-gray-900 border border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setDateRange(p => ({ ...p, startDate: e.target.value }))}
            />
            <input
              type="date"
              className="bg-gray-900 border border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setDateRange(p => ({ ...p, endDate: e.target.value }))}
            />

            <button
              onClick={fetchReports}
              className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg shadow-md transition hover:scale-105"
            >
              Apply
            </button>

            <button
              onClick={() => handleExport('payments')}
              className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg flex items-center shadow-md transition hover:scale-105"
            >
              <Download className="w-4 mr-2" /> Payments
            </button>

            <button
              onClick={() => handleExport('invoices')}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg flex items-center shadow-md transition hover:scale-105"
            >
              <Download className="w-4 mr-2" /> Invoices
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          {[
            { title: 'Total Billed', value: formatCurrency(financialData?.summary?.totalBilled || 0), icon: FileText },
            { title: 'Collected', value: formatCurrency(financialData?.summary?.totalPaid || 0), icon: DollarSign },
            { title: 'Outstanding', value: formatCurrency(financialData?.summary?.totalOutstanding || 0), icon: TrendingUp },
            {
              title: 'Collection Rate',
              value: financialData?.summary?.totalBilled > 0
                ? ((financialData.summary.totalPaid / financialData.summary.totalBilled) * 100).toFixed(1) + '%'
                : '0%',
              icon: BarChart3
            }
          ].map((card, i) => (
            <div key={i} className="bg-gray-800/70 backdrop-blur-md border border-gray-700 p-5 rounded-xl shadow-lg hover:shadow-indigo-500/10 transition hover:scale-[1.02]">
              <card.icon className="text-indigo-400 mb-2" />
              <p className="text-gray-400 text-sm">{card.title}</p>
              <p className="text-xl text-white font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          <div className="bg-gray-800/70 backdrop-blur-md border border-gray-700 p-5 rounded-xl">
            <h3 className="text-white mb-3">Monthly Trend</h3>
            <ResponsiveContainer height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid stroke="#444" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800/70 backdrop-blur-md border border-gray-700 p-5 rounded-xl">
            <h3 className="text-white mb-3">Payment Methods</h3>
            <ResponsiveContainer height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid stroke="#444" />
                <XAxis dataKey="_id" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="total" fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Pie */}
        <div className="bg-gray-800/70 backdrop-blur-md border border-gray-700 p-5 rounded-xl">
          <h3 className="text-white mb-3">Invoice Status</h3>
          <ResponsiveContainer height={300}>
            <PieChart>
              <Pie data={statusChartData} dataKey="value" outerRadius={100}>
                {statusChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

export default Reports;