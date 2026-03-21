const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// @route   POST /api/payments/process
// @desc    Process payment (SIMULATED)
// @access  Public
router.post('/process', async (req, res) => {
  try {
    const {
      invoiceId,
      amount,
      paymentMethod,
      cardNumber,
      studentName
    } = req.body;
    
    // Validate required fields
    if (!invoiceId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Find invoice
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
        message: 'Invoice is already paid'
      });
    }
    
    // SIMULATED PAYMENT PROCESSING
    // In real app, this would call Stripe/PayPal API
    // For demo, we just create payment record
    
    // Get last 4 digits of card
    const cardLastFour = cardNumber ? cardNumber.slice(-4) : null;
    
    // Create payment record
    const payment = new Payment({
      invoice: invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      student: invoice.student,
      studentName: studentName || invoice.studentName,
      amount: parseFloat(amount),
      paymentMethod,
      cardLastFour,
      status: 'Completed',
      remarks: 'Payment processed successfully (Simulated)'
    });
    
    await payment.save();
    
    // Update invoice
    invoice.amountPaid += parseFloat(amount);
    invoice.outstandingBalance = invoice.totalAmount - invoice.amountPaid;
    
    if (invoice.outstandingBalance <= 0) {
      invoice.status = 'Paid';
    } else {
      invoice.status = 'Partially Paid';
    }
    
    await invoice.save();
    
    res.json({
      success: true,
      message: 'Payment processed successfully!',
      data: {
        payment,
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
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

// @route   GET /api/payments
// @desc    Get payment history for a student
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    
    const query = studentId ? { studentName: studentId } : {}; // Using studentName as studentId for demo
    const payments = await Payment.find(query)
      .populate('invoice')
      .sort({ paymentDate: -1 });
    
    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
});

// @route   GET /api/payments/:id
// @desc    Get single payment by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('invoice');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
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
});

module.exports = router;