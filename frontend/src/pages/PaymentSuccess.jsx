import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    // First try to get from location.state
    if (location.state?.payment) {
      setPayment(location.state.payment);
      localStorage.setItem('payment', JSON.stringify(location.state.payment));
    } else {
      // fallback to localStorage
      const storedPayment = localStorage.getItem('payment');
      if (storedPayment) setPayment(JSON.parse(storedPayment));
    }

    if (location.state?.invoice) {
      setInvoice(location.state.invoice);
      localStorage.setItem('invoice', JSON.stringify(location.state.invoice));
    } else {
      const storedInvoice = localStorage.getItem('invoice');
      if (storedInvoice) setInvoice(JSON.parse(storedInvoice));
    }
  }, [location.state]);

  // If no payment data found anywhere
  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Payment Data</h2>
          <p className="text-gray-600 mb-6">Payment information not found</p>
          <button 
            onClick={() => navigate('/invoices')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Invoices
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d)) return '-';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    const value = amount ?? 0;
    return `LKR ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon & Message */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 text-lg">Your payment has been processed successfully</p>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-semibold text-gray-900">{payment.transactionId || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Receipt Number:</span>
              <span className="font-semibold text-gray-900">{payment.receiptNumber || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Payment Date:</span>
              <span className="font-semibold text-gray-900">{formatDate(payment.paymentDate)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900">{payment.paymentMethod || '-'}</span>
            </div>
            {payment.cardLastFour && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Card Number:</span>
                <span className="font-semibold text-gray-900">**** **** **** {payment.cardLastFour}</span>
              </div>
            )}
            <div className="flex justify-between py-4 border-t-2 border-gray-200 mt-3">
              <span className="text-lg font-semibold text-gray-900">Amount Paid:</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        {invoice && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Status</h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-medium text-gray-900">{invoice.invoiceNumber || '-'}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100 text-green-600">
                <span>Amount Paid:</span>
                <span className="font-medium">{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-600">Outstanding Balance:</span>
                <span className={`font-medium ${invoice.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(invoice.outstandingBalance)}
                </span>
              </div>
              <div className="text-center pt-4">
                <span className={`inline-block px-6 py-2 rounded-full text-sm font-semibold ${
                  invoice.status === 'Paid' ? 'bg-green-100 text-green-800 border border-green-200' : 
                  invoice.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                  'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {invoice.status || '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Email Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Receipt Sent</p>
            <p className="text-sm text-blue-700 mt-1">A payment receipt has been sent to your email address</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/invoices')}
            className="bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            View Invoices
          </button>
          <button 
            onClick={() => navigate('/payment-history')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Payment History
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;