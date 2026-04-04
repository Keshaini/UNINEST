const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const { generateReceipt } = require('../utils/pdfGenerator');
const { sendPaymentConfirmation } = require('../utils/emailService');
const {
  validateAmount,
  validateCardNumber,
  validateCVV,
  validateExpiryDate,
  sanitizeInput
} = require('../utils/validators');

// Process payment with comprehensive validation
const processPayment = async (req, res) => {
  try {
    const {
      invoiceId,
      amount,
      paymentMethod,
      cardNumber,
      cardholderName,
      expiryDate,
      cvv,
      studentName
    } = req.body;

    // ========== VALIDATION ==========

    // Required fields
    if (!invoiceId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['invoiceId', 'amount', 'paymentMethod']
      });
    }

    // Validate invoice ID format
    if (!invoiceId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID format'
      });
    }

    // Validate amount
    if (!validateAmount(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount. Must be between 1 and 1,000,000 LKR'
      });
    }

    // Validate payment method
    const validMethods = ['Credit Card', 'Debit Card', 'Bank Transfer', 'Cash', 'Online Wallet'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
        validMethods
      });
    }

    // Validate card details for card payments
    if (['Credit Card', 'Debit Card'].includes(paymentMethod)) {
      if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
        return res.status(400).json({
          success: false,
          message: 'Card details are required for card payments',
          required: ['cardNumber', 'cardholderName', 'expiryDate', 'cvv']
        });
      }

      // Validate card number (Luhn algorithm)
      if (!validateCardNumber(cardNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid card number. Please check and try again.'
        });
      }

      // Validate cardholder name
      const sanitizedName = sanitizeInput(cardholderName);
      if (sanitizedName.length < 3 || sanitizedName.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Cardholder name must be between 3 and 50 characters'
        });
      }

      if (!/^[a-zA-Z\s]+$/.test(sanitizedName)) {
        return res.status(400).json({
          success: false,
          message: 'Cardholder name can only contain letters and spaces'
        });
      }

      // Validate expiry date
      if (!validateExpiryDate(expiryDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired card. Please check the expiry date.'
        });
      }

      // Validate CVV
      if (!validateCVV(cvv)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid CVV. Must be 3 or 4 digits.'
        });
      }
    }

    // ========== BUSINESS LOGIC ==========

    // Find and validate invoice
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check if invoice is already paid
    if (invoice.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This invoice has already been paid in full'
      });
    }

    // Check if invoice is cancelled
    if (invoice.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot process payment for cancelled invoice'
      });
    }

    // Validate payment amount doesn't exceed outstanding balance
    if (amount > invoice.outstandingBalance) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${amount.toLocaleString()}) exceeds outstanding balance (${invoice.outstandingBalance.toLocaleString()})`,
        outstandingBalance: invoice.outstandingBalance
      });
    }

    // Minimum payment validation (at least 1000 LKR or full amount if less)
    const minimumPayment = Math.min(1000, invoice.outstandingBalance);
    if (amount < minimumPayment) {
      return res.status(400).json({
        success: false,
        message: `Minimum payment amount is LKR ${minimumPayment.toLocaleString()}`,
        minimumPayment
      });
    }

    // Simulate payment gateway processing
    // In production, this would call actual payment gateway API
    const paymentGatewayResponse = await simulatePaymentGateway({
      amount,
      cardNumber,
      expiryDate,
      cvv
    });

    if (!paymentGatewayResponse.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment declined by payment gateway',
        reason: paymentGatewayResponse.reason
      });
    }

    // Create payment record
    const payment = await Payment.create({
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      studentName: studentName || invoice.studentName,
      amount,
      paymentMethod,
      cardLastFour: cardNumber ? cardNumber.slice(-4) : null,
      status: 'Completed',
      verified: ['Credit Card', 'Debit Card'].includes(paymentMethod)
    });

    // Update invoice
    invoice.amountPaid += amount;
    invoice.outstandingBalance = invoice.totalAmount - invoice.amountPaid;

    // Update invoice status
    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.status = 'Paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'Partially Paid';
    }

    await invoice.save();

    // Generate PDF receipt
    try {
      const receiptPath = await generateReceipt(payment, invoice);
      payment.receiptPdf = receiptPath;
      await payment.save();
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      // Continue even if PDF fails
    }

    // Send confirmation email
    try {
      await sendPaymentConfirmation(
        `${invoice.studentId}@student.sliit.lk`,
        payment,
        invoice
      );
      payment.notificationSent = true;
      await payment.save();
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Continue even if email fails
    }

    // Create notification
    await Notification.create({
      userId: invoice.studentId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Your payment of LKR ${amount.toLocaleString()} has been processed successfully.`,
      link: `/payment-success?receiptNumber=${payment.receiptNumber}`,
      priority: 'high'
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment: {
          receiptNumber: payment.receiptNumber,
          transactionId: payment.transactionId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          paymentDate: payment.paymentDate,
          status: payment.status,
          receiptPdf: payment.receiptPdf
        },
        invoice: {
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
          amountPaid: invoice.amountPaid,
          outstandingBalance: invoice.outstandingBalance,
          status: invoice.status
        }
      }
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
};

// Simulate payment gateway (replace with real gateway in production)
const simulatePaymentGateway = async ({ amount, cardNumber, expiryDate, cvv }) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Test card for success: 4532148803436467
  // Test card for decline: 4000000000000002
  if (cardNumber === '4000000000000002') {
    return {
      success: false,
      reason: 'Insufficient funds'
    };
  }

  // Random 5% failure rate for testing
  if (Math.random() < 0.05) {
    return {
      success: false,
      reason: 'Transaction declined by bank'
    };
  }

  return {
    success: true,
    transactionId: `TXN${Date.now()}`
  };
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const {
      studentId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'paymentDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};

    if (studentId) {
      // Find all invoices for this student
      const invoices = await Invoice.find({ studentId }).select('_id');
      filter.invoiceId = { $in: invoices.map(inv => inv._id) };
    }

    if (status) {
      if (!['Pending', 'Completed', 'Failed', 'Refunded'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const payments = await Payment.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('invoiceId', 'invoiceNumber studentName studentId');

    const total = await Payment.countDocuments(filter);

    // Statistics
    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$amount' },
          count: { $sum: 1 },
          avgPayment: { $avg: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      statistics: stats[0] || { totalPaid: 0, count: 0, avgPayment: 0 },
      data: payments
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

// Get single payment by receipt number
const getPaymentByReceiptNumber = async (req, res) => {
  try {
    const { receiptNumber } = req.params;

    const payment = await Payment.findOne({ receiptNumber })
      .populate('invoiceId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

module.exports = {
  processPayment,
  getPaymentHistory,
  getPaymentByReceiptNumber
};