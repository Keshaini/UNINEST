import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
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
      setVerifications(response.data || []);
    } catch (err) {
      setError('Failed to load pending verifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this payment?`)) return;

    setProcessing(id);
    setError('');

    try {
      const response = await verifyBankTransfer(id, {
        status,
        notes: verificationNotes
      });

      if (response.success) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center text-gray-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Loading verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] py-8 px-4 text-gray-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Payment Verification</h1>
            <p className="text-gray-400 mt-2">Review and verify bank transfers</p>
          </div>
          <button
            onClick={fetchPendingVerifications}
            className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-600 p-4 mb-6 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <p className="text-gray-400">Pending Verifications</p>
          <p className="text-3xl font-bold text-white">{verifications.length}</p>
        </div>

        {/* Empty */}
        {verifications.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl text-white font-semibold">All Caught Up!</h3>
            <p className="text-gray-400">No pending verifications</p>
          </div>
        ) : (
          <div className="space-y-6">
            {verifications.map((verification) => (
              <div key={verification._id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">

                <div className="flex flex-col lg:flex-row gap-6">

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Payment ID: {verification.paymentId?._id}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Invoice: {verification.invoiceId?.invoiceNumber}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-400">Student</p>
                        <p className="text-white">{verification.invoiceId?.studentName}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Student ID</p>
                        <p className="text-white">{verification.invoiceId?.studentId}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Amount</p>
                        <p className="text-white">{formatCurrency(verification.paymentId?.amount || 0)}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    <textarea
                      value={selectedPayment === verification._id ? verificationNotes : ''}
                      onChange={(e) => {
                        setSelectedPayment(verification._id);
                        setVerificationNotes(e.target.value);
                      }}
                      rows="3"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-gray-200 focus:ring-2 focus:ring-indigo-500"
                      placeholder="Add notes..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 w-full lg:w-40">
                    <button
                      onClick={() => handleVerify(verification._id, 'Verified')}
                      disabled={processing === verification._id}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </button>

                    <button
                      onClick={() => handleVerify(verification._id, 'Rejected')}
                      disabled={processing === verification._id}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </button>
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