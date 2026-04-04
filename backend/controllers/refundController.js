const Refund = require('../models/Refund');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const {
  validateAmount,
  validateBankAccount,
  sanitizeInput
} = require('../utils/validators');

// Request refund (Student)
const requestRefund = async (req, res) => {
  try {
    const {
      invoiceId,
      paymentId,
      amount,
      reason,
      refundMethod,
      bankDetails
    } = req.body;

    // ========== VALIDATION ==========

    if (!invoiceId || !paymentId || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['invoiceId', 'paymentId', 'amount', 'reason']
      });
    }

    // Validate IDs
    if (!invoiceId.match(/^[0-9a-fA-F]{24}$/) || !paymentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice or payment ID format'
      });
    }

    // Validate amount
    if (!validateAmount(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refund amount'
      });
    }

    // Validate reason length
    const sanitizedReason = sanitizeInput(reason);
    if (sanitizedReason.length < 10 || sanitizedReason.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Reason must be between 10 and 500 characters'
      });
    }

    // Validate refund method
    const validMethods = ['Bank Transfer', 'Cash', 'Original Payment Method'];
    if (refundMethod && !validMethods.includes(refundMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refund method',
        validMethods
      });
    }

    // Validate bank details if bank transfer
    if (refundMethod === 'Bank Transfer') {
      if (!bankDetails || !bankDetails.accountNumber || !bankDetails.accountName || !bankDetails.bankName) {
        return res.status(400).json({
          success: false,
          message: 'Bank details are required for bank transfer refunds',
          required: ['accountNumber', 'accountName', 'bankName', 'branchCode']
        });
      }

      if (!validateBankAccount(bankDetails.accountNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bank account number format'
        });
      }

      // Sanitize bank details
      bankDetails.accountName = sanitizeInput(bankDetails.accountName);
      bankDetails.bankName = sanitizeInput(bankDetails.bankName);
      bankDetails.branchCode = sanitizeInput(bankDetails.branchCode || '');
    }

    // ========== BUSINESS LOGIC ==========

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment matches invoice
    if (payment.invoiceId.toString() !== invoiceId) {
      return res.status(400).json({
        success: false,
        message: 'Payment does not belong to this invoice'
      });
    }

    // Check if payment is already refunded
    if (payment.refunded) {
      return res.status(400).json({
        success: false,
        message: 'This payment has already been refunded'
      });
    }

    // Validate refund amount doesn't exceed payment amount
    if (amount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: `Refund amount (${amount}) cannot exceed payment amount (${payment.amount})`,
        maxRefundAmount: payment.amount
      });
    }

    // Check for existing pending refund
    const existingRefund = await Refund.findOne({
      paymentId,
      status: 'Pending'
    });

    if (existingRefund) {
      return res.status(400).json({
        success: false,
        message: 'A refund request for this payment is already pending'
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

    // Create refund request
    const refund = await Refund.create({
      invoiceId,
      paymentId,
      studentName: invoice.studentName,
      studentId: invoice.studentId,
      amount,
      reason: sanitizedReason,
      refundMethod: refundMethod || 'Original Payment Method',
      bankDetails: refundMethod === 'Bank Transfer' ? bankDetails : undefined,
      status: 'Pending'
    });

    // Create notification for student
    await Notification.create({
      userId: invoice.studentId,
      type: 'refund_requested',
      title: 'Refund Request Submitted',
      message: `Your refund request of LKR ${amount.toLocaleString()} has been submitted and is pending approval.`,
      link: `/refunds/${refund._id}`,
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Refund request submitted successfully',
      data: refund
    });

  } catch (error) {
    console.error('Error requesting refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit refund request',
      error: error.message
    });
  }
};

// Get all refunds (with filters)
const getAllRefunds = async (req, res) => {
  try {
    const {
      status,
      studentId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (status) {
      const validStatuses = ['Pending', 'Approved', 'Rejected', 'Processed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
          validStatuses
        });
      }
      filter.status = status;
    }

    if (studentId) {
      filter.studentId = studentId;
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const refunds = await Refund.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('invoiceId', 'invoiceNumber')
      .populate('paymentId', 'receiptNumber transactionId');

    const total = await Refund.countDocuments(filter);

    const stats = await Refund.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: refunds.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      statistics: stats,
      data: refunds
    });

  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refunds',
      error: error.message
    });
  }
};

// Get single refund
const getRefundById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refund ID format'
      });
    }

    const refund = await Refund.findById(id)
      .populate('invoiceId')
      .populate('paymentId');

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund not found'
      });
    }

    res.status(200).json({
      success: true,
      data: refund
    });

  } catch (error) {
    console.error('Error fetching refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund',
      error: error.message
    });
  }
};

// Process refund (Admin only)
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // Validation
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refund ID format'
      });
    }

    const validStatuses = ['Approved', 'Rejected', 'Processed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        validStatuses
      });
    }

    // Find refund
    const refund = await Refund.findById(id);
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund not found'
      });
    }

    // Check if already processed
    if (refund.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Refund has already been ${refund.status.toLowerCase()}`
      });
    }

    // Update refund
    refund.status = status;
    refund.processedBy = req.user?.id || 'admin';
    refund.processedDate = new Date();
    refund.adminNotes = sanitizeInput(adminNotes || '');
    await refund.save();

    // If approved, update payment and invoice
    if (status === 'Approved' || status === 'Processed') {
      const payment = await Payment.findById(refund.paymentId);
      const invoice = await Invoice.findById(refund.invoiceId);

      if (payment && invoice) {
        // Update payment
        payment.refunded = true;
        payment.refundAmount = refund.amount;
        await payment.save();

        // Update invoice
        invoice.amountPaid -= refund.amount;
        invoice.outstandingBalance = invoice.totalAmount - invoice.amountPaid;

        // Update status
        if (invoice.amountPaid === 0) {
          invoice.status = 'Unpaid';
        } else if (invoice.amountPaid < invoice.totalAmount) {
          invoice.status = 'Partially Paid';
        }

        await invoice.save();
      }
    }

    // Create notification
    const notificationType = status === 'Approved' || status === 'Processed' 
      ? 'refund_approved' 
      : 'refund_rejected';

    const notificationMessage = status === 'Approved' || status === 'Processed'
      ? `Your refund request of LKR ${refund.amount.toLocaleString()} has been approved.`
      : `Your refund request of LKR ${refund.amount.toLocaleString()} has been rejected.`;

    await Notification.create({
      userId: refund.studentId,
      type: notificationType,
      title: status === 'Approved' || status === 'Processed' ? 'Refund Approved' : 'Refund Rejected',
      message: notificationMessage,
      link: `/refunds/${refund._id}`,
      priority: 'high'
    });

    res.status(200).json({
      success: true,
      message: `Refund ${status.toLowerCase()} successfully`,
      data: refund
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};

module.exports = {
  requestRefund,
  getAllRefunds,
  getRefundById,
  processRefund
};