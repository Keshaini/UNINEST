import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { getPendingVerifications, verifyBankTransfer } from '../../services/paymentService';

function PaymentVerification() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    setLoading(true);
    try {
      const response = await getPendingVerifications();
      if (response.success) {
        setVerifications(response.data);
      }
    } catch (err) {
      setError('Failed to load pending verifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this payment?`)) {
      return;
    }

    setProcessing(id);
    setError('');

    try {
      const response = await verifyBankTransfer(id, {
        status,
        notes: verificationNotes
      });

      if (response.success) {
        // Remove from list
        setVerifications(prev => prev.filter(v => v._id !== id));
        setSelectedPayment(null);
        setVerificationNotes('');
        alert(`Payment ${status.toLowerCase()} successfully!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${status.toLowerCase()} payment`);
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
              <p className="text-gray-600 mt-2">Review and verify bank transfer payments</p>
            </div>
            <button
              onClick={fetchPendingVerifications}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Verifications</p>
              <p className="text-3xl font-bold text-gray-900">{verifications.length}</p>
            </div>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Verifications List */}
        {verifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600">
              There are no pending payment verifications at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {verifications.map((verification) => (
              <div
                key={verification._id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  {/* Payment Info */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Side - Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Payment ID: {verification.paymentId?._id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Invoice: {verification.invoiceId?.invoiceNumber}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          Pending Verification
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Student Name</p>
                          <p className="font-semibold text-gray-900">
                            {verification.invoiceId?.studentName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Student ID</p>
                          <p className="font-semibold text-gray-900">
                            {verification.invoiceId?.studentId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(verification.paymentId?.amount || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Bank Name</p>
                          <p className="font-semibold text-gray-900">
                            {verification.bankTransferDetails?.bankName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Transaction Ref</p>
                          <p className="font-semibold text-gray-900">
                            {verification.bankTransferDetails?.transactionReference}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Transfer Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(verification.bankTransferDetails?.transferDate).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>

                      {/* Receipt Image */}
                      {verification.bankTransferDetails?.receiptImage && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Transfer Receipt:</p>
                          <div className="border border-gray-300 rounded-lg p-2 inline-block">
                            <img
                              src={`http://localhost:5000${verification.bankTransferDetails.receiptImage}`}
                              alt="Transfer receipt"
                              className="max-w-full h-auto max-h-96 rounded cursor-pointer"
                              onClick={() => window.open(`http://localhost:5000${verification.bankTransferDetails.receiptImage}`, '_blank')}
                            />
                          </div>
                        </div>
                      )}

                      {/* Verification Notes Input */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verification Notes (Optional)
                        </label>
                        <textarea
                          value={selectedPayment === verification._id ? verificationNotes : ''}
                          onChange={(e) => {
                            setSelectedPayment(verification._id);
                            setVerificationNotes(e.target.value);
                          }}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Add any notes about this verification..."
                        />
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="lg:w-48 flex lg:flex-col gap-3">
                      <button
                        onClick={() => handleVerify(verification._id, 'Verified')}
                        disabled={processing === verification._id}
                        className="flex-1 lg:flex-none flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing === verification._id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Approve
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleVerify(verification._id, 'Rejected')}
                        disabled={processing === verification._id}
                        className="flex-1 lg:flex-none flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing === verification._id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 mr-2" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentVerification;