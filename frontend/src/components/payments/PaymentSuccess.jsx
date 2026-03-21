import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { payment, invoice } = location.state || {};

  if (!payment) {
    return (
      <div className="payment-success-container">
        <div className="error-box">
          <h2>❌ No Payment Data</h2>
          <p>Payment information not found</p>
          <button onClick={() => navigate('/invoices')}>Go to Invoices</button>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
        </div>

        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-subtitle">Your payment has been processed successfully</p>

        <div className="payment-details">
          <div className="detail-row">
            <span className="detail-label">Transaction ID:</span>
            <span className="detail-value">{payment.transactionId}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Receipt Number:</span>
            <span className="detail-value">{payment.receiptNumber}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Payment Date:</span>
            <span className="detail-value">{formatDate(payment.paymentDate)}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Payment Method:</span>
            <span className="detail-value">{payment.paymentMethod}</span>
          </div>
          
          {payment.cardLastFour && (
            <div className="detail-row">
              <span className="detail-label">Card Number:</span>
              <span className="detail-value">**** **** **** {payment.cardLastFour}</span>
            </div>
          )}
          
          <div className="detail-divider"></div>
          
          <div className="detail-row amount-row">
            <span className="detail-label">Amount Paid:</span>
            <span className="detail-value highlight">{formatCurrency(payment.amount)}</span>
          </div>
        </div>

        {invoice && (
          <div className="invoice-status">
            <h3>Invoice Status</h3>
            <div className="status-row">
              <span>Invoice Number:</span>
              <span className="bold">{invoice.invoiceNumber}</span>
            </div>
            <div className="status-row">
              <span>Total Amount:</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="status-row">
              <span>Amount Paid:</span>
              <span className="paid">{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="status-row">
              <span>Outstanding Balance:</span>
              <span className={invoice.outstandingBalance > 0 ? 'outstanding' : 'paid'}>
                {formatCurrency(invoice.outstandingBalance)}
              </span>
            </div>
            <div className="status-badge">
              <span className={`badge ${invoice.status.toLowerCase().replace(' ', '-')}`}>
                {invoice.status}
              </span>
            </div>
          </div>
        )}

        <div className="success-notice">
          📧 A receipt has been sent to your email address
        </div>

        <div className="action-buttons">
          <button 
            className="btn-secondary"
            onClick={() => navigate('/invoices')}
          >
            View Invoices
          </button>
          <button 
            className="btn-primary"
            onClick={() => navigate('/payment-history')}
          >
            Payment History
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;