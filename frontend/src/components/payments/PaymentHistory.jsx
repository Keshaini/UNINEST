import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPayments } from '../../services/paymentService';
import './PaymentHistory.css';

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
      setPayments(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load payment history');
      setLoading(false);
      console.error(err);
    }
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

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#27ae60';
      case 'Pending':
        return '#f39c12';
      case 'Failed':
        return '#e74c3c';
      case 'Refunded':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const totalPaid = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="payment-history-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history-container">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchPayments}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history-container">
      <div className="history-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/invoices')}>
            ← Back to Invoices
          </button>
          <h1>📊 Payment History</h1>
          <p>View all your payment transactions</p>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-info">
            <span className="summary-label">Total Paid</span>
            <span className="summary-value">{formatCurrency(totalPaid)}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📝</div>
          <div className="summary-info">
            <span className="summary-label">Total Transactions</span>
            <span className="summary-value">{payments.length}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-info">
            <span className="summary-label">Completed</span>
            <span className="summary-value">
              {payments.filter(p => p.status === 'Completed').length}
            </span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h3>Filter by Status:</h3>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({payments.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'Completed' ? 'active' : ''}`}
            onClick={() => setFilter('Completed')}
          >
            Completed ({payments.filter(p => p.status === 'Completed').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'Pending' ? 'active' : ''}`}
            onClick={() => setFilter('Pending')}
          >
            Pending ({payments.filter(p => p.status === 'Pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'Failed' ? 'active' : ''}`}
            onClick={() => setFilter('Failed')}
          >
            Failed ({payments.filter(p => p.status === 'Failed').length})
          </button>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="no-payments">
          <p>📭 No payments found for this filter</p>
        </div>
      ) : (
        <div className="payments-table">
          <div className="table-header">
            <div className="col-date">Date</div>
            <div className="col-receipt">Receipt No.</div>
            <div className="col-invoice">Invoice</div>
            <div className="col-method">Method</div>
            <div className="col-amount">Amount</div>
            <div className="col-status">Status</div>
          </div>

          {filteredPayments.map((payment) => (
            <div key={payment._id} className="table-row">
              <div className="col-date">
                <span className="mobile-label">Date:</span>
                {formatDate(payment.paymentDate)}
              </div>
              <div className="col-receipt">
                <span className="mobile-label">Receipt:</span>
                <span className="receipt-no">{payment.receiptNumber}</span>
              </div>
              <div className="col-invoice">
                <span className="mobile-label">Invoice:</span>
                {payment.invoiceNumber}
              </div>
              <div className="col-method">
                <span className="mobile-label">Method:</span>
                <div className="method-info">
                  {payment.paymentMethod}
                  {payment.cardLastFour && (
                    <span className="card-digits">**** {payment.cardLastFour}</span>
                  )}
                </div>
              </div>
              <div className="col-amount">
                <span className="mobile-label">Amount:</span>
                <span className="amount">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="col-status">
                <span className="mobile-label">Status:</span>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(payment.status) }}
                >
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentHistory;