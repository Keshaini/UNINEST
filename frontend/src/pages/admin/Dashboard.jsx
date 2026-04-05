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

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <div className="w-64 bg-white shadow-lg p-5">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <button
            onClick={() => navigate('/admin/invoice/create')}
            className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
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

          <div className="bg-white p-4 rounded shadow">
            <h2 className="mb-3">Invoice Status</h2>
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

          <div className="bg-white p-4 rounded shadow">
            <h2 className="mb-3">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyTrend}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" />
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
    className="cursor-pointer p-2 rounded hover:bg-gray-100 text-gray-700"
  >
    {label}
  </div>
);

const ActionCard = ({ label, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg flex items-center gap-3"
  >
    {icon}
    <p className="font-medium">{label}</p>
  </div>
);

const Card = ({ label, value, icon }) => (
  <div className="bg-white p-4 rounded shadow flex justify-between">
    <div>
      <p>{label}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
    {icon}
  </div>
);

export default Dashboard;