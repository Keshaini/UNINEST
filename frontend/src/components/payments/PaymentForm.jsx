import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoiceById, processPayment } from '../../services/paymentService';
import './PaymentForm.css';

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
      setInvoice(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      alert('Failed to load invoice');
      navigate('/invoices');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      setFormData({ ...formData, [name]: formatted });
    }
    // Format expiry date
    else if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length >= 2) {
        const formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        setFormData({ ...formData, [name]: formatted });
      } else {
        setFormData({ ...formData, [name]: cleaned });
      }
    }
    // Format CVV
    else if (name === 'cvv') {
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setFormData({ ...formData, [name]: cleaned });
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'cardholderName':
        if (!value.trim()) {
          error = 'Cardholder name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Name must contain only letters';
        } else if (value.trim().length < 3) {
          error = 'Name must be at least 3 characters';
        }
        break;
        
      case 'cardNumber':
        const cleaned = value.replace(/\s/g, '');
        if (!cleaned) {
          error = 'Card number is required';
        } else if (!/^\d+$/.test(cleaned)) {
          error = 'Card number must contain only digits';
        } else if (cleaned.length !== 16) {
          error = 'Card number must be 16 digits';
        } else if (!luhnCheck(cleaned)) {
          error = 'Invalid card number';
        }
        break;
        
      case 'expiryDate':
        if (!value) {
          error = 'Expiry date is required';
        } else if (!/^\d{2}\/\d{2}$/.test(value)) {
          error = 'Format must be MM/YY';
        } else {
          const [month, year] = value.split('/').map(Number);
          if (month < 1 || month > 12) {
            error = 'Invalid month';
          } else {
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;
            if (year < currentYear || (year === currentYear && month < currentMonth)) {
              error = 'Card has expired';
            }
          }
        }
        break;
        
      case 'cvv':
        if (!value) {
          error = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(value)) {
          error = 'CVV must be 3 or 4 digits';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  // Luhn algorithm for card validation
  const luhnCheck = (cardNumber) => {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const validateForm = () => {
    const fields = ['cardholderName', 'cardNumber', 'expiryDate', 'cvv'];
    let isValid = true;
    const newErrors = {};
    
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    setTouched({
      cardholderName: true,
      cardNumber: true,
      expiryDate: true,
      cvv: true
    });
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix all errors before submitting');
      return;
    }
    
    setProcessing(true);
    
    // Simulate processing delay
    setTimeout(async () => {
      try {
        const response = await processPayment({
          invoiceId,
          amount: invoice.outstandingBalance,
          paymentMethod: formData.paymentMethod,
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          studentName: invoice.studentName
        });
        
        setProcessing(false);
        
        // Navigate to success page with payment data
        navigate('/payment-success', { 
          state: { 
            payment: response.data.payment,
            invoice: response.data.invoice
          }
        });
        
      } catch (error) {
        setProcessing(false);
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
      }
    }, 2500); // 2.5 second simulated processing
  };

  if (loading) {
    return (
      <div className="payment-form-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="payment-form-container">
        <div className="error-message">
          <p>Invoice not found</p>
          <button onClick={() => navigate('/invoices')}>Back to Invoices</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-form-container">
      <div className="payment-form-wrapper">
        <div className="payment-header">
          <button className="back-button" onClick={() => navigate('/invoices')}>
            ← Back to Invoices
          </button>
          <h1>💳 Payment Details</h1>
          <p>Complete your payment securely</p>
        </div>

        <div className="payment-summary">
          <h3>Invoice Summary</h3>
          <div className="summary-row">
            <span>Invoice Number:</span>
            <span className="bold">{invoice.invoiceNumber}</span>
          </div>
          <div className="summary-row">
            <span>Student Name:</span>
            <span>{invoice.studentName}</span>
          </div>
          <div className="summary-row">
            <span>Total Amount:</span>
            <span>LKR {invoice.totalAmount.toLocaleString()}</span>
          </div>
          {invoice.amountPaid > 0 && (
            <div className="summary-row">
              <span>Amount Paid:</span>
              <span className="paid">LKR {invoice.amountPaid.toLocaleString()}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Amount to Pay:</span>
            <span className="amount-highlight">
              LKR {invoice.outstandingBalance.toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="form-control"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Cardholder Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleChange}
              onBlur={() => handleBlur('cardholderName')}
              className={`form-control ${touched.cardholderName && errors.cardholderName ? 'error' : ''}`}
              placeholder="John Doe"
            />
            {touched.cardholderName && errors.cardholderName && (
              <span className="error-text">{errors.cardholderName}</span>
            )}
          </div>

          <div className="form-group">
            <label>
              Card Number <span className="required">*</span>
            </label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              onBlur={() => handleBlur('cardNumber')}
              className={`form-control ${touched.cardNumber && errors.cardNumber ? 'error' : ''}`}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
            />
            {touched.cardNumber && errors.cardNumber && (
              <span className="error-text">{errors.cardNumber}</span>
            )}
            <small className="form-hint">Test card: 4532 1488 0343 6467</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Expiry Date <span className="required">*</span>
              </label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                onBlur={() => handleBlur('expiryDate')}
                className={`form-control ${touched.expiryDate && errors.expiryDate ? 'error' : ''}`}
                placeholder="MM/YY"
                maxLength="5"
              />
              {touched.expiryDate && errors.expiryDate && (
                <span className="error-text">{errors.expiryDate}</span>
              )}
            </div>

            <div className="form-group">
              <label>
                CVV <span className="required">*</span>
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                onBlur={() => handleBlur('cvv')}
                className={`form-control ${touched.cvv && errors.cvv ? 'error' : ''}`}
                placeholder="123"
                maxLength="4"
              />
              {touched.cvv && errors.cvv && (
                <span className="error-text">{errors.cvv}</span>
              )}
            </div>
          </div>

          <div className="security-notice">
            🔒 Your payment is secure and encrypted
          </div>

          <button 
            type="submit" 
            className="btn-submit-payment"
            disabled={processing}
          >
            {processing ? (
              <>
                <div className="button-spinner"></div>
                Processing Payment...
              </>
            ) : (
              <>💰 Pay LKR {invoice.outstandingBalance.toLocaleString()}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PaymentForm;