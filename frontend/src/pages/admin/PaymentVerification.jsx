import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { getPendingVerifications, verifyBankTransfer } from '../../services/paymentService';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/common/ConfirmationModal';

function PaymentVerification() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [error, setError] = useState('');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    onConfirm: () => {},
    title: '',
    message: '',
    type: 'danger'
  });

  const openConfirm = (title, message, onConfirm, type = 'danger') => {
    setConfirmModal({
        isOpen: true,
        title,
        message,
        onConfirm,
        type
    });
  };

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
      toast.error('Failed to load pending verifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    const action = status === 'Verified' ? 'approve' : 'reject';
    const type = status === 'Verified' ? 'info' : 'danger';
    
    openConfirm(
      `${status === 'Verified' ? 'Approve' : 'Reject'} Payment?`,
      `Are you sure you want to ${action} this bank transfer payment? This will update the invoice status accordingly.`,
      async () => {
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
            toast.success(`Payment ${status.toLowerCase()} successfully!`);
          }
        } catch (err) {
          toast.error(err.response?.data?.message || `Failed to ${status.toLowerCase()} payment`);
        } finally {
          setProcessing(null);
        }
      },
      type
    );
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
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] animate-fade-in py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Payment Verification</h1>
            <p className="text-slate-400 mt-1">Review and verify bank transfer payments</p>
          </div>
          <button
            onClick={fetchPendingVerifications}
            className="flex items-center px-5 py-2.5 bg-slate-800 border border-slate-700/50 text-slate-200 rounded-xl hover:bg-slate-700 transition-all font-medium shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh List
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Queue Size</p>
                    <p className="text-3xl font-bold text-white">{verifications.length}</p>
                </div>
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                    <AlertCircle className="w-7 h-7 text-indigo-400" />
                </div>
            </div>
        </div>

        {/* Verifications List */}
        {verifications.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-20 text-center shadow-inner">
            <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">All Caught Up!</h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              There are no pending payment verifications to review at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {verifications.map((verification) => (
              <div
                key={verification._id}
                className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl transition-all hover:border-indigo-500/30"
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side - Details */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between mb-8 gap-4 pb-6 border-b border-slate-800/50">
                        <div>
                          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Payment ID: {verification.paymentId?._id}</p>
                          <h3 className="text-xl font-bold text-white">
                             Invoice #{verification.invoiceId?.invoiceNumber}
                          </h3>
                        </div>
                        <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-500/20">
                          Pending Approval
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <PaymentDetail label="Student Name" value={verification.invoiceId?.studentName} />
                        <PaymentDetail label="Student ID" value={verification.invoiceId?.studentId} />
                        <PaymentDetail label="Total Amount" value={formatCurrency(verification.paymentId?.amount || 0)} highlight />
                        <PaymentDetail label="Bank Name" value={verification.bankTransferDetails?.bankName} />
                        <PaymentDetail label="Transaction Ref" value={verification.bankTransferDetails?.transactionReference} />
                        <PaymentDetail label="Transfer Date" value={new Date(verification.bankTransferDetails?.transferDate).toLocaleDateString('en-GB')} />
                      </div>

                      {/* Receipt Image */}
                      {verification.bankTransferDetails?.receiptImage && (
                        <div className="mb-8">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Transfer Receipt Proof</p>
                          <div className="relative group cursor-pointer border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all max-w-sm bg-slate-950 p-2 shadow-inner">
                            <img
                              src={`http://localhost:5000${verification.bankTransferDetails.receiptImage}`}
                              alt="Transfer receipt"
                              className="w-full h-auto rounded-xl object-contain max-h-60 opacity-80 group-hover:opacity-100 transition-opacity"
                              onClick={() => window.open(`http://localhost:5000${verification.bankTransferDetails.receiptImage}`, '_blank')}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold text-white flex items-center gap-2 border border-slate-700">
                                    <Eye className="w-4 h-4" /> Click to expand
                                </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Verification Notes Input */}
                      <div className="mt-8 pt-8 border-t border-slate-800/50">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                          Verification Feedback (Private Notes)
                        </label>
                        <textarea
                          value={selectedPayment === verification._id ? verificationNotes : ''}
                          onChange={(e) => {
                            setSelectedPayment(verification._id);
                            setVerificationNotes(e.target.value);
                          }}
                          rows="2"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-2xl p-4 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 font-medium"
                          placeholder="Add any internal notes about this transaction..."
                        />
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="lg:w-48 flex lg:flex-col gap-3 shrink-0 pt-0 lg:pt-14">
                      <button
                        onClick={() => handleVerify(verification._id, 'Verified')}
                        disabled={processing === verification._id}
                        className="flex-1 lg:flex-none flex items-center justify-center px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-emerald-500/20 active:scale-95"
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
                        className="flex-1 lg:flex-none flex items-center justify-center px-6 py-3 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-2xl hover:bg-rose-600 hover:text-white disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all font-bold active:scale-95"
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

      <ConfirmationModal 
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
      />
    </div>
  );
}

// Helper component for details
const PaymentDetail = ({ label, value, highlight }) => (
    <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px] mb-1">{label}</p>
        <p className={`font-semibold tracking-tight ${highlight ? 'text-indigo-400 text-lg' : 'text-slate-200'}`}>{value || 'N/A'}</p>
    </div>
);

export default PaymentVerification;