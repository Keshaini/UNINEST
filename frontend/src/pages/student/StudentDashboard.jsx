import { useNavigate } from 'react-router-dom';
import { FileText, CreditCard, DollarSign } from 'lucide-react';

function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-lg p-5">
        <h2 className="text-xl font-bold mb-6">Student Panel</h2>

        <nav className="space-y-3">
          <NavItem label="Dashboard" onClick={() => navigate('/student/dashboard')} />
          <NavItem label="My Invoices" onClick={() => navigate('/student/invoices')} />
          <NavItem label="Payment" onClick={() => navigate('/student/payment-form/:invoiceId')} />
          <NavItem label="Payment History" onClick={() => navigate('/student/payment-history')} />
        </nav>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

        {/* QUICK ACTIONS */}
        <div className="grid md:grid-cols-3 gap-4">

          <ActionCard
            label="View My Invoices"
            icon={<FileText />}
            onClick={() => navigate('/student/invoices')}
          />

          <ActionCard
            label="Make Payment"
            icon={<CreditCard />}
            onClick={() => navigate('/student/payment')}
          />

          <ActionCard
            label="Payment History"
            icon={<DollarSign />}
            onClick={() => navigate('/student/payments')}
          />

        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

const NavItem = ({ label, onClick }) => (
  <div onClick={onClick} className="cursor-pointer p-2 hover:bg-gray-100 rounded">
    {label}
  </div>
);

const ActionCard = ({ label, icon, onClick }) => (
  <div onClick={onClick} className="bg-white p-4 rounded shadow cursor-pointer flex gap-3">
    {icon}
    <p>{label}</p>
  </div>
);

export default StudentDashboard;