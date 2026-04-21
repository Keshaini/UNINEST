import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../services/paymentService';

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
      setInvoices(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load invoices');
      setLoading(false);
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Unpaid': return 'bg-red-100 text-red-800 border-red-200';
      case 'Overdue': return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) {
      return "LKR 0.00";
    }

    return `LKR ${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Invoices</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchInvoices}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Invoices</h1>
              <p className="mt-1 text-gray-600">View and manage your hostel fee invoices</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                <span className="text-sm text-gray-600">Total: </span>
                <span className="text-lg font-semibold text-indigo-600">{invoices.length}</span>
              </div>
              <button 
                onClick={() => navigate('/payment-history')}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                Payment History →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Invoices Found</h3>
            <p className="text-gray-600 mb-6">You don't have any invoices at the moment</p>
            <button 
              onClick={() => navigate('/payment-history')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View Payment History
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {invoices.map((invoice) => (
              <div key={invoice._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-indigo-100 text-xs font-medium mb-1">INVOICE</div>
                      <h3 className="text-white text-xl font-bold">{invoice.invoiceNumber}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="text-white text-sm">
                    <div className="font-medium">{invoice.studentName}</div>
                    <div className="text-indigo-200 text-xs mt-1">{invoice.studentId}</div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Date Information */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Invoice Date</span>
                      <span className="font-medium text-gray-900">{formatDate(invoice.invoiceDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Due Date</span>
                      <span className="font-medium text-red-600">{formatDate(invoice.dueDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Semester</span>
                      <span className="font-medium text-gray-900">{invoice.semester}, {invoice.academicYear}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 uppercase mb-2">Items</div>
                    <div className="space-y-1">
                      {invoice.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.description}</span>
                          <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({invoice.discountPercentage}%)</span>
                        <span className="font-medium">- {formatCurrency(invoice.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total Amount</span>
                      <span className="text-indigo-600">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                    {invoice.amountPaid > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Amount Paid</span>
                        <span className="font-medium">{formatCurrency(invoice.amountPaid)}</span>
                      </div>
                    )}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-red-900">Outstanding Balance</span>
                        <span className="text-lg font-bold text-red-600">{formatCurrency(invoice.outstandingBalance)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6">
                    {invoice.status !== 'Paid' ? (
                      <button 
                        onClick={() => navigate(`/payment-form/${invoice._id}`)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Pay Now
                      </button>
                    ) : (
                      <div className="w-full bg-green-50 border border-green-200 text-green-700 py-3 px-4 rounded-lg font-medium text-center flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Paid in Full
                      </div>
                    )}
                  </div>
                </div>

                {/* Overdue Banner */}
                {invoice.status === 'Overdue' && (
                  <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
                    ⚠️ Payment Overdue - Please pay immediately
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceView;