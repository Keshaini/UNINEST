import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle } from 'lucide-react';
import { getInvoices } from '../../services/paymentService';

function InvoiceList() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await getInvoices();

      // ✅ IMPORTANT (based on your backend structure)
      setInvoices(response.data || response.data?.data || []);
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
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Partially Paid':
        return 'bg-yellow-100 text-yellow-700';
      case 'Unpaid':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="p-6">Loading invoices...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600">Manage all student invoices</p>
          </div>

          <button
            onClick={() => navigate('/admin/invoice/create')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <PlusCircle className="w-5 h-5" />
            Create Invoice
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Student</th>
                <th className="p-4">Total</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Balance</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{inv.invoiceNumber}</td>
                    <td className="p-4">{inv.studentName}</td>
                    <td className="p-4">{formatCurrency(inv.totalAmount)}</td>
                    <td className="p-4">{formatCurrency(inv.amountPaid)}</td>
                    <td className="p-4">{formatCurrency(inv.outstandingBalance)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default InvoiceList;