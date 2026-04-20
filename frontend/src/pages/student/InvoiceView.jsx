import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../../services/paymentService';

function InvoiceView() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const response = await getInvoices();

      // ✅ If backend sends user-specific invoices → just use response.data
      // ✅ If not → filter manually (temporary)
      const studentId = localStorage.getItem('studentId');

      const filtered = response.data?.filter(
        (inv) => inv.studentId === studentId || !studentId // fallback for now
      );

      setInvoices(filtered || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  // ✅ LKR currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      case 'Overdue': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ LOADING
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading invoices...</p>
      </div>
    );
  }

  // ✅ ERROR
  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Invoices</h1>

        <button
          onClick={() => navigate('/payment-history')}
          className="text-indigo-600 font-medium"
        >
          View Payment History →
        </button>
      </div>

      {/* EMPTY */}
      {invoices.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No invoices available
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {invoices.map((inv) => (
            <div key={inv._id} className="bg-white shadow rounded-lg p-5">

              {/* HEADER */}
              <div className="flex justify-between mb-3">
                <h3 className="font-bold text-lg">{inv.invoiceNumber}</h3>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(inv.status)}`}>
                  {inv.status}
                </span>
              </div>

              {/* INFO */}
              <p className="text-sm text-gray-600">
                Due: {formatDate(inv.dueDate)}
              </p>

              <p className="text-sm text-gray-600">
                Semester: {inv.semester || '-'}
              </p>

              {/* ITEMS */}
              <div className="mt-4 border-t pt-3">
                <p className="text-sm font-semibold mb-2">Charges</p>

                {inv.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.description}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="mt-4 border-t pt-3 space-y-1 text-sm">

                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-semibold">
                    {formatCurrency(inv.totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>Paid</span>
                  <span>{formatCurrency(inv.amountPaid)}</span>
                </div>

                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Balance</span>
                  <span>{formatCurrency(inv.outstandingBalance)}</span>
                </div>
              </div>

              {/* ACTION */}
              <div className="mt-4">

                {inv.status !== 'Paid' ? (
                  <button
                    onClick={() => navigate(`/payment-form/${inv._id}`)}
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                  >
                    Pay Now
                  </button>
                ) : (
                  <div className="text-center text-green-600 font-medium">
                    Paid ✔
                  </div>
                )}

              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default InvoiceView;