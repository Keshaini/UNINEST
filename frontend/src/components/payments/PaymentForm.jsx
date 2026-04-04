import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoiceById, processPayment } from '../../services/paymentService';
import { toast } from 'react-toastify';

function PaymentForm() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'Credit Card'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await getInvoiceById(invoiceId);
      setInvoice(response?.data ?? null);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to load invoice');
      navigate('/invoice-create');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      updatedValue = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    } else if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      updatedValue = cleaned.length >= 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` : cleaned;
    } else if (name === 'cvv') {
      updatedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData({ ...formData, [name]: updatedValue });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'cardholderName':
        if (!value.trim()) error = 'Cardholder name is required';
        else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Name must contain only letters';
        else if (value.trim().length < 3) error = 'Name must be at least 3 characters';
        break;
      case 'cardNumber':
        const cleaned = value.replace(/\s/g, '');
        if (!cleaned) error = 'Card number is required';
        else if (!/^\d+$/.test(cleaned)) error = 'Card number must contain only digits';
        else if (cleaned.length !== 16) error = 'Card number must be 16 digits';
        break;
      case 'expiryDate':
        if (!value) error = 'Expiry date is required';
        else if (!/^\d{2}\/\d{2}$/.test(value)) error = 'Format must be MM/YY';
        else {
          const [month, year] = value.split('/').map(Number);
          const currentYear = new Date().getFullYear() % 100;
          const currentMonth = new Date().getMonth() + 1;
          if (month < 1 || month > 12) error = 'Invalid month';
          else if (year < currentYear || (year === currentYear && month < currentMonth)) error = 'Card has expired';
        }
        break;
      case 'cvv':
        if (!value) error = 'CVV is required';
        else if (!/^\d{3,4}$/.test(value)) error = 'CVV must be 3 or 4 digits';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const validateForm = () => {
    const fields = ['cardholderName', 'cardNumber', 'expiryDate', 'cvv'];
    let isValid = true;
    fields.forEach(field => {
      if (!validateField(field, formData[field])) isValid = false;
    });
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.warning('Please fix all errors before submitting');

    setProcessing(true);

    setTimeout(async () => {
      try {
        const response = await processPayment({
          invoiceId,
          amount: invoice?.outstandingBalance ?? 0,
          paymentMethod: formData.paymentMethod,
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          studentName: invoice?.studentName ?? ''
        });

        const rawPayment = response.payment ?? null;
        const updatedInvoice = response.invoice ?? {};

        if (!rawPayment) {
          toast.info('Payment was processed but no payment data returned.');
          navigate('/invoice');
          return;
        }

        // Map backend keys to frontend expected keys
        const payment = {
          transactionId: rawPayment.id,
          receiptNumber: rawPayment.id, // fallback if backend doesn’t have separate receipt
          amount: rawPayment.amount,
          paymentMethod: rawPayment.method,
          paymentDate: rawPayment.date,
          cardLastFour: formData.cardNumber.slice(-4)
        };

        // Save to localStorage for fallback
        localStorage.setItem('payment', JSON.stringify(payment));
        localStorage.setItem('invoice', JSON.stringify(updatedInvoice));

        toast.success('Payment successful!');
        navigate('/payment-success', { state: { payment, invoice: updatedInvoice } });
      } catch (error) {
        console.error('Payment error:', error);
        toast.error('Payment failed. Please try again.');
      } finally {
        setProcessing(false);
      }
    }, 2500);
  };

  const formatCurrency = (amount) => {
    return `LKR ${(amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading payment details...</p>
      </div>
    </div>
  );

  if (!invoice) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Invoice not found</h3>
        <button 
          onClick={() => navigate('/invoice')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Back to Invoices
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header and Invoice Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <button 
              onClick={() => navigate('/invoice')}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-4 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Invoices
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
            <p className="text-gray-600 mt-1">Enter your payment details securely</p>
          </div>

          {/* Invoice Summary */}
          <div className="p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Student Name:</span>
                <span className="font-medium text-gray-900">{invoice.studentName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Amount Paid:</span>
                  <span className="font-medium">{formatCurrency(invoice.amountPaid)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-3 mt-3">
                <span className="text-gray-900">Amount to Pay:</span>
                <span className="text-indigo-600">{formatCurrency(invoice.outstandingBalance)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
              </select>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleChange}
                onBlur={() => handleBlur('cardholderName')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  touched.cardholderName && errors.cardholderName 
                    ? 'border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {touched.cardholderName && errors.cardholderName && (
                <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
              )}
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                onBlur={() => handleBlur('cardNumber')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  touched.cardNumber && errors.cardNumber 
                    ? 'border-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              {touched.cardNumber && errors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Test card: 4532 1488 0343 6467</p>
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  onBlur={() => handleBlur('expiryDate')}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    touched.expiryDate && errors.expiryDate 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="MM/YY"
                  maxLength="5"
                />
                {touched.expiryDate && errors.expiryDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  onBlur={() => handleBlur('cvv')}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    touched.cvv && errors.cvv 
                      ? 'border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="123"
                  maxLength="4"
                />
                {touched.cvv && errors.cvv && (
                  <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-900">Secure Payment</p>
                <p className="text-sm text-green-700 mt-1">Your payment information is encrypted and secure</p>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={processing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Pay {formatCurrency(invoice.outstandingBalance)}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PaymentForm;