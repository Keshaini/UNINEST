const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const PaymentMethod = require('../models/PaymentMethod');
const Notification = require('../models/Notification');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const { validateAmount } = require('../utils/validators');

// Submit bank transfer payment
router.post('/', upload.single('receiptImage'), async (req, res) => {
  try {
    const {
      invoiceId,
      amount,
      bankName,
      transactionReference,
      transferDate,
      studentName
    } = req.body;

    // Validation
    if (!invoiceId || !amount || !bankName || !transactionReference || !transferDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['invoiceId', 'amount', 'bankName', 'transactionReference', 'transferDate', 'receiptImage']
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Receipt image is required'
      });
    }

    if (!validateAmount(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
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

    // Validate amount
    if (parseFloat(amount) > invoice.outstandingBalance) {
      return res.status(400).json({
        success: false,
        message: 'Amount exceeds outstanding balance',
        outstandingBalance: invoice.outstandingBalance
      });
    }

    // Create pending payment
    const payment = await Payment.create({
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      studentName: studentName || invoice.studentName,
      amount: parseFloat(amount),
      paymentMethod: 'Bank Transfer',
      status: 'Pending',
      verified: false,
      verificationRequired: true
    });

    // Create payment method record with receipt
    const paymentMethod = await PaymentMethod.create({
      invoiceId,
      paymentId: payment._id,
      method: 'Bank Transfer',
      status: 'Pending',
      bankTransferDetails: {
        receiptImage: `/uploads/bank-transfers/${req.file.filename}`,
        transactionReference,
        bankName,
        transferDate: new Date(transferDate),
        uploadDate: new Date()
      }
    });

    // Create notification for admin
    await Notification.create({
      userId: 'admin',
      type: 'payment_verification_required',
      title: 'New Bank Transfer Pending Verification',
      message: `Bank transfer of LKR ${amount} from ${invoice.studentName} needs verification`,
      link: `/admin/verifications`,
      priority: 'high'
    });

    // Create notification for student
    await Notification.create({
      userId: invoice.studentId,
      type: 'payment_pending',
      title: 'Payment Submitted for Verification',
      message: `Your bank transfer payment of LKR ${amount} is pending verification`,
      link: `/payment-history`,
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Bank transfer submitted successfully. Pending verification.',
      data: {
        payment,
        paymentMethod
      }
    });

  } catch (error) {
    console.error('Error processing bank transfer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bank transfer',
      error: error.message
    });
  }
});

// Get bank transfer status
router.get('/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const paymentMethod = await PaymentMethod.findOne({ paymentId })
      .populate('paymentId')
      .populate('invoiceId');

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.status(200).json({
      success: true,
      data: paymentMethod
    });

  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status',
      error: error.message
    });
  }
});

module.exports = router;