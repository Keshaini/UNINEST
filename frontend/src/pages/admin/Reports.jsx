import { useState, useEffect } from 'react';
import { Download, TrendingUp, Calendar, DollarSign, FileText, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getFinancialSummary, getPaymentAnalytics, exportPayments, exportInvoices } from '../../services/paymentService';

function Reports() {
  const [financialData, setFinancialData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const [financialResponse, analyticsResponse] = await Promise.all([
        getFinancialSummary(params),
        getPaymentAnalytics()
      ]);

      if (financialResponse.success) {
        setFinancialData(financialResponse.data);
      }

      if (analyticsResponse.success) {
        setAnalyticsData(analyticsResponse.data);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      if (type === 'payments') {
        await exportPayments(params);
      } else if (type === 'invoices') {
        await exportInvoices(params);
      }
    } catch (err) {
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Prepare chart data
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
    month: `${item._id.month}/${item._id.year}`,
    amount: item.totalPayments,
    count: item.count
  })) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive billing and payment insights</p>
        </div>

        {/* Date Range Filter & Export */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchReports}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Apply Filter
              </button>
              <button
                onClick={() => handleExport('payments')}
                disabled={exporting}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Payments
              </button>
              <button
                onClick={() => handleExport('invoices')}
                disabled={exporting}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Invoices
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Billed</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(financialData?.summary?.totalBilled || 0)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(financialData?.summary?.totalPaid || 0)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Outstanding</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(financialData?.summary?.totalOutstanding || 0)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Collection Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {financialData?.summary?.totalBilled > 0
                ? ((financialData?.summary?.totalPaid / financialData?.summary?.totalBilled) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Payment Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  name="Total Amount"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'total') return formatCurrency(value);
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#4F46E5" name="Count" />
                <Bar dataKey="total" fill="#10B981" name="Total Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Invoice Status Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Analytics */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Analytics</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Average Payment Time</p>
                <p className="text-2xl font-bold text-blue-900">
                  {analyticsData?.paymentTiming?.avgDays?.toFixed(1) || 0} days
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Fastest Payment</p>
                  <p className="text-xl font-bold text-green-900">
                    {analyticsData?.paymentTiming?.minDays?.toFixed(0) || 0} days
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 mb-1">Slowest Payment</p>
                  <p className="text-xl font-bold text-red-900">
                    {analyticsData?.paymentTiming?.maxDays?.toFixed(0) || 0} days
                  </p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 mb-2">Payment Success Rate</p>
                <div className="space-y-2">
                  {analyticsData?.successRate?.map(item => (
                    <div key={item._id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{item._id}:</span>
                      <span className="font-semibold text-purple-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Students Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 Paying Students</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Paid</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Payments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analyticsData?.topStudents?.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-bold text-indigo-600">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{student._id}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(student.totalPaid)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-gray-900">{student.paymentCount}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refund Statistics */}
        {financialData?.refunds && financialData.refunds.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Refund Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {financialData.refunds.map(refund => (
                <div key={refund._id} className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{refund._id}</p>
                  <p className="text-xl font-bold text-gray-900">{refund.count}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(refund.totalAmount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;