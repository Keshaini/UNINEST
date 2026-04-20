import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, FileText, CreditCard, Clock,
  Percent, BarChart3, PlusCircle
} from 'lucide-react';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats({
      overview: {
        totalInvoices: 120,
        totalPayments: 95,
        pendingVerifications: 5,
        totalRevenue: 850000
      },
      invoicesByStatus: [
        { _id: 'Paid', count: 80 },
        { _id: 'Unpaid', count: 20 },
        { _id: 'Partial', count: 20 }
      ],
      monthlyTrend: [
        { month: 'Jan', amount: 100000 },
        { month: 'Feb', amount: 120000 },
        { month: 'Mar', amount: 90000 },
        { month: 'Apr', amount: 150000 }
      ]
    });
  }, []);

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amt || 0);

  const COLORS = ['#22c55e', '#ef4444', '#facc15'];

  if (!stats) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#0a0c10] text-slate-300">

      {/* ================= SIDEBAR ================= */}
      <div className="w-64 bg-[#111827] border-r border-gray-800 p-5">
        <h2 className="text-xl font-bold mb-6 text-white">Admin Panel</h2>

        <nav className="space-y-3">
          <NavItem label="Dashboard" onClick={() => navigate('/admin/dashboard')} />
          <NavItem label="Invoices" onClick={() => navigate('/admin/invoices')} />
          <NavItem label="Create Invoice" onClick={() => navigate('/admin/invoice/create')} />
          <NavItem label="Verify Payments" onClick={() => navigate('/admin/verifications')} />
          <NavItem label="Discounts" onClick={() => navigate('/admin/discounts')} />
          <NavItem label="Reports" onClick={() => navigate('/admin/reports')} />
        </nav>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>

          <button
            onClick={() => navigate('/admin/invoice/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Create Invoice
          </button>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <ActionCard label="Manage Invoices" icon={<FileText />} onClick={() => navigate('/admin/invoices')} />
          <ActionCard label="Verify Payments" icon={<Clock />} onClick={() => navigate('/admin/verifications')} />
          <ActionCard label="Discounts" icon={<Percent />} onClick={() => navigate('/admin/discounts')} />
          <ActionCard label="Reports" icon={<BarChart3 />} onClick={() => navigate('/admin/reports')} />
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card label="Invoices" value={stats.overview.totalInvoices} icon={<FileText />} />
          <Card label="Payments" value={stats.overview.totalPayments} icon={<CreditCard />} />
          <Card label="Pending" value={stats.overview.pendingVerifications} icon={<Clock />} />
          <Card label="Revenue" value={formatCurrency(stats.overview.totalRevenue)} icon={<DollarSign />} />
        </div>

        {/* CHARTS */}
        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 shadow">
            <h2 className="mb-3 text-white">Invoice Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.invoicesByStatus} dataKey="count" nameKey="_id">
                  {stats.invoicesByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 shadow">
            <h2 className="mb-3 text-white">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyTrend}>
                <XAxis dataKey="month" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="amount" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

const NavItem = ({ label, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer p-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition"
  >
    {label}
  </div>
);

const ActionCard = ({ label, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-[#111827] border border-gray-800 p-4 rounded-xl cursor-pointer hover:shadow-lg hover:bg-gray-800 flex items-center gap-3 transition"
  >
    {icon}
    <p className="font-medium text-white">{label}</p>
  </div>
);

const Card = ({ label, value, icon }) => (
  <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl flex justify-between items-center shadow">
    <div>
      <p className="text-gray-400">{label}</p>
      <h2 className="text-xl font-bold text-white">{value}</h2>
    </div>
    <div className="text-indigo-400">{icon}</div>
  </div>
);

export default Dashboard;