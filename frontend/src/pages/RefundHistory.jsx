import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Filter, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { getRefunds } from '../services/paymentService';

function RefundHistory() {
  const navigate = useNavigate();
  
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRefunds();
  }, [filter]);

  const fetchRefunds = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getRefunds(params);
      
      if (response.success) {
        setRefunds(response.data);
      }
    } catch (err) {
      setError('Failed to load refund history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock
      },
      'Approved': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle
      },
      'Rejected': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle
      },
      'Processed': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: CheckCircle
      }
    };

    const badge = badges[status] || badges['Pending'];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading refund history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Refund History</h1>
          <p className="text-gray-600 mt-2">Track all your refund requests</p>
        </div>

        {/* Filters & Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('Pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'Pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('Approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'Approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter('Rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'Rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setFilter('Processed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'Processed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Processed
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchRefunds}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Refunds List */}
        {refunds.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Refund Requests
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'You haven\'t submitted any refund requests yet.'
                : `No ${filter.toLowerCase()} refund requests found.`
              }
            </p>
            <button
              onClick={() => navigate('/payment-history')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Payment History
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {refunds.map((refund) => (
              <div
                key={refund._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Left Side - Refund Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {refund.refundNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Invoice: {refund.invoiceId?.invoiceNumber || 'N/A'}
                        </p>
                      </div>
                      {getStatusBadge(refund.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <p className="font-semibold text-gray-900">
                          LKR {refund.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Request Date:</span>
                        <p className="font-medium text-gray-900">
                          {formatDate(refund.requestDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Method:</span>
                        <p className="font-medium text-gray-900">
                          {refund.refundMethod}
                        </p>
                      </div>
                      {refund.processedDate && (
                        <div>
                          <span className="text-gray-600">Processed:</span>
                          <p className="font-medium text-gray-900">
                            {formatDate(refund.processedDate)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Reason */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-semibold text-gray-600 uppercase">Reason:</span>
                      <p className="text-sm text-gray-800 mt-1">{refund.reason}</p>
                    </div>

                    {/* Admin Notes */}
                    {refund.adminNotes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <span className="text-xs font-semibold text-blue-600 uppercase">Admin Notes:</span>
                        <p className="text-sm text-blue-800 mt-1">{refund.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex md:flex-col gap-2 md:w-32">
                    <button
                      onClick={() => navigate(`/refunds/${refund._id}`)}
                      className="flex-1 md:flex-none px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      View Details
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

export default RefundHistory;