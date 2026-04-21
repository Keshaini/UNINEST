import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { requestRefund, getPaymentByReceipt, getInvoiceById } from '../services/paymentService';

function RefundRequest() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  
  const [payment, setPayment] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    refundMethod: 'Original Payment Method',
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      branchCode: ''
    }
  });

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      // In real implementation, you'd fetch by payment ID
      // For now, we'll simulate
      setLoading(false);
    } catch (err) {
      setError('Failed to load payment details');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid refund amount');
      return false;
    }

    if (formData.reason.length < 10) {
      setError('Please provide a detailed reason (minimum 10 characters)');
      return false;
    }

    if (formData.refundMethod === 'Bank Transfer') {
      const { accountName, accountNumber, bankName } = formData.bankDetails;
      if (!accountName || !accountNumber || !bankName) {
        setError('Please provide complete bank details');
        return false;
      }

      if (!/^\d{10,15}$/.test(accountNumber)) {
        setError('Please enter a valid bank account number (10-15 digits)');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const refundData = {
        invoiceId: invoice?._id || 'invoice_id_here',
        paymentId: paymentId,
        amount: parseFloat(formData.amount),
        reason: formData.reason,
        refundMethod: formData.refundMethod,
        ...(formData.refundMethod === 'Bank Transfer' && {
          bankDetails: formData.bankDetails
        })
      };

      const response = await requestRefund(refundData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/refund-history');
        }, 3000);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Refund Request Submitted!
            </h2>
            <p className="text-gray-600 mb-2">
              Your refund request has been submitted successfully.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Our team will review your request and notify you within 3-5 business days.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/refund-history')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View Refund History
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Invoices
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Request Refund</h1>
          <p className="text-gray-600 mt-2">Submit a refund request for your payment</p>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Refund Policy:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Refund requests are reviewed within 3-5 business days</li>
                <li>Approved refunds are processed within 7-10 business days</li>
                <li>Refunds can be issued to your bank account or original payment method</li>
                <li>A valid reason must be provided for all refund requests</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Payment Info Display */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Payment ID:</span>
                  <p className="font-medium text-gray-900">{paymentId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Payment Amount:</span>
                  <p className="font-medium text-gray-900">LKR 45,000.00</p>
                </div>
                <div>
                  <span className="text-gray-600">Payment Date:</span>
                  <p className="font-medium text-gray-900">15 Mar 2026</p>
                </div>
                <div>
                  <span className="text-gray-600">Payment Method:</span>
                  <p className="font-medium text-gray-900">Credit Card</p>
                </div>
              </div>
            </div>

            {/* Refund Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount (LKR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter refund amount"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Maximum refundable: LKR 45,000.00</p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Refund <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Please provide a detailed reason for your refund request (minimum 10 characters)"
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                {formData.reason.length}/500 characters
              </p>
            </div>

            {/* Refund Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Method <span className="text-red-500">*</span>
              </label>
              <select
                name="refundMethod"
                value={formData.refundMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="Original Payment Method">Original Payment Method</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            {/* Bank Details (Conditional) */}
            {formData.refundMethod === 'Bank Transfer' && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Bank Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.bankDetails.accountName}
                      onChange={handleBankDetailsChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter account holder name"
                      required={formData.refundMethod === 'Bank Transfer'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={handleBankDetailsChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter account number"
                      required={formData.refundMethod === 'Bank Transfer'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bankName"
                      value={formData.bankDetails.bankName}
                      onChange={handleBankDetailsChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required={formData.refundMethod === 'Bank Transfer'}
                    >
                      <option value="">Select bank</option>
                      <option value="Bank of Ceylon">Bank of Ceylon</option>
                      <option value="People's Bank">People's Bank</option>
                      <option value="Commercial Bank">Commercial Bank</option>
                      <option value="Sampath Bank">Sampath Bank</option>
                      <option value="Hatton National Bank">Hatton National Bank</option>
                      <option value="Nations Trust Bank">Nations Trust Bank</option>
                      <option value="DFCC Bank">DFCC Bank</option>
                      <option value="Seylan Bank">Seylan Bank</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="branchCode"
                      value={formData.bankDetails.branchCode}
                      onChange={handleBankDetailsChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter branch code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Refund Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RefundRequest;