import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPayments } from '../../services/paymentService';

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getPayments();
      let data = response?.data || [];

      // If no data returned, create some dummy payments for demo
      if (!data.length) {
        data = [
          {
            _id: '1',
            transactionId: 'PAY1001',
            receiptNumber: 'RCPT1001',
            invoiceNumber: 'INV-1001',
            paymentDate: new Date(),
            paymentMethod: 'Credit Card',
            cardLastFour: '1234',
            amount: 20000,
            status: 'Completed'
          },
          {
            _id: '2',
            transactionId: 'PAY1002',
            receiptNumber: 'RCPT1002',
            invoiceNumber: 'INV-1002',
            paymentDate: new Date(),
            paymentMethod: 'Debit Card',
            cardLastFour: '5678',
            amount: 15000,
            status: 'Pending'
          },
          {
            _id: '3',
            transactionId: 'PAY1003',
            receiptNumber: 'RCPT1003',
            invoiceNumber: 'INV-1003',
            paymentDate: new Date(),
            paymentMethod: 'Credit Card',
            cardLastFour: '9876',
            amount: 35000,
            status: 'Completed'
          },
          {
            _id: '4',
            transactionId: 'PAY1004',
            receiptNumber: 'RCPT1004',
            invoiceNumber: 'INV-1004',
            paymentDate: new Date(),
            paymentMethod: 'Debit Card',
            cardLastFour: '4321',
            amount: 1200,
            status: 'Failed'
          },
          {
            _id: '5',
            transactionId: 'PAY1005',
            receiptNumber: 'RCPT1005',
            invoiceNumber: 'INV-1005',
            paymentDate: new Date(),
            paymentMethod: 'Credit Card',
            cardLastFour: '2468',
            amount: 2800,
            status: 'Refunded'
          }
        ];
      }

      setPayments(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load payment history');
      setLoading(false);
      console.error(err);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'LKR 0.00';
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'Refunded': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredPayments = payments.filter(payment => filter === 'all' || payment.status === filter);

  const totalPaid = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading payment history...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Error Loading History</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={fetchPayments}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button 
            onClick={() => navigate('/invoice')}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-4 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Invoices
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="mt-1 text-gray-600">View all your payment transactions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'Completed').length}</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Filter by Status</h3>
          <div className="flex flex-wrap gap-3">
            {['all','Completed','Pending','Failed','Refunded'].map(s => (
              <button 
                key={s}
                onClick={() => setFilter(s)}
                className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                  filter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)} ({s==='all'?payments.length:payments.filter(p=>p.status===s).length})
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-xl font-semibold text-gray-900">No payments found</p>
            <p className="text-gray-600 mt-2">No payments match the selected filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Receipt No.</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map(payment => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(payment.paymentDate)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600">{payment.receiptNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{payment.invoiceNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {payment.paymentMethod || '-'} {payment.cardLastFour ? `(**** ${payment.cardLastFour})` : ''}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                          {payment.status || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredPayments.map(payment => (
                <div key={payment._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm font-medium text-indigo-600 mb-1">{payment.receiptNumber || '-'}</div>
                      <div className="text-xs text-gray-500">{formatDate(payment.paymentDate)}</div>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                      {payment.status || '-'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Invoice:</span>
                      <span className="font-medium">{payment.invoiceNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium">
                        {payment.paymentMethod || '-'} {payment.cardLastFour ? `(**** ${payment.cardLastFour})` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Amount:</span>
                      <span className="text-green-600">{formatCurrency(payment.amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;