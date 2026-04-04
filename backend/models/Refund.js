const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  refundNumber: {
    type: String,
    unique: true
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Processed'],
    default: 'Pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  processedDate: Date,
  processedBy: String,
  adminNotes: String,
  refundMethod: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'Original Payment Method'],
    default: 'Original Payment Method'
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    branchCode: String
  }
}, {
  timestamps: true
});

// Auto-generate refund number
refundSchema.pre('save', async function(next) {
  if (!this.refundNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Refund').countDocuments();
    this.refundNumber = `REF-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Refund', refundSchema);