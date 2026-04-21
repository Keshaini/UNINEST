const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    unique: true
  },
  transactionId: {
    type: String,
    unique: true
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Bank Transfer', 'Cash', 'Online Wallet'],
    required: true
  },
  cardLastFour: {
    type: String,
    default: null
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Completed'
  },
  // NEW FIELDS (from 100% version)
  receiptPdf: {
    type: String,
    default: null
  },
  refunded: {
    type: Boolean,
    default: false
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  verificationRequired: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate receipt number and transaction ID
paymentSchema.pre('save', async function(next) {
  // Generate receipt number
  if (!this.receiptNumber) {
    const year = new Date().getFullYear();
    const Payment = mongoose.model('Payment');
    const count = await Payment.countDocuments();
    this.receiptNumber = `REC-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  // Generate transaction ID
  if (!this.transactionId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionId = `TXN-${timestamp}-${random}`;
  }

  next();
});

module.exports = mongoose.model('Payment', paymentSchema);