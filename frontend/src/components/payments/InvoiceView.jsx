import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../../services/paymentService';
import './InvoiceView.css';

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
      case 'Paid':
        return '#27ae60';
      case 'Partially Paid':
        return '#f39c12';
      case 'Unpaid':
        return '#e74c3c';
      case 'Overdue':
        return '#c0392b';
      default:
        return '#95a5a6';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handlePayNow = (invoice) => {
    navigate(`/payment-form/${invoice._id}`);
  };

  if (loading) {
    return (
      <div className="invoice-view">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-view">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchInvoices}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-view">
      <div className="invoice-header">
        <h1>💳 My Invoices</h1>
        <p>View and manage your hostel fee invoices</p>
      </div>

      {invoices.length === 0 ? (
        <div className="no-invoices">
          <p>📋 No invoices found</p>
          <button onClick={() => navigate('/payment-history')}>
            View Payment History
          </button>
        </div>
      ) : (
        <div className="invoices-grid">
          {invoices.map((invoice) => (
            <div key={invoice._id} className="invoice-card">
              <div className="invoice-card-header">
                <div>
                  <h3>{invoice.invoiceNumber}</h3>
                  <p className="invoice-student">{invoice.studentName} ({invoice.studentId})</p>
                </div>
                <span 
                  className="invoice-status"
                  style={{ backgroundColor: getStatusColor(invoice.status) }}
                >
                  {invoice.status}
                </span>
              </div>

              <div className="invoice-card-body">
                <div className="invoice-detail-row">
                  <span className="label">Invoice Date:</span>
                  <span className="value">{formatDate(invoice.invoiceDate)}</span>
                </div>
                <div className="invoice-detail-row">
                  <span className="label">Due Date:</span>
                  <span className="value due-date">{formatDate(invoice.dueDate)}</span>
                </div>
                <div className="invoice-detail-row">
                  <span className="label">Semester:</span>
                  <span className="value">{invoice.semester}, {invoice.academicYear}</span>
                </div>

                <div className="invoice-divider"></div>

                <div className="invoice-items">
                  <h4>Items:</h4>
                  {invoice.items.map((item, index) => (
                    <div key={index} className="invoice-item">
                      <span>{item.description}</span>
                      <span>{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>

                <div className="invoice-divider"></div>

                <div className="invoice-amounts">
                  <div className="amount-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="amount-row discount">
                      <span>Discount ({invoice.discountPercentage}%):</span>
                      <span>- {formatCurrency(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="amount-row total">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                  {invoice.amountPaid > 0 && (
                    <div className="amount-row paid">
                      <span>Amount Paid:</span>
                      <span>{formatCurrency(invoice.amountPaid)}</span>
                    </div>
                  )}
                  <div className="amount-row outstanding">
                    <span>Outstanding Balance:</span>
                    <span className="highlight">{formatCurrency(invoice.outstandingBalance)}</span>
                  </div>
                </div>
              </div>

              <div className="invoice-card-footer">
                {invoice.status !== 'Paid' && (
                  <button 
                    className="btn-pay-now"
                    onClick={() => handlePayNow(invoice)}
                  >
                    💰 Pay Now
                  </button>
                )}
                {invoice.status === 'Paid' && (
                  <button className="btn-download-receipt" disabled>
                    📄 Download Receipt
                  </button>
                )}
              </div>

              {invoice.status === 'Overdue' && (
                <div className="overdue-banner">
                  ⚠️ Payment Overdue - Please pay immediately
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InvoiceView;