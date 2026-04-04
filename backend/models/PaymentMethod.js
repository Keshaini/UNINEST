const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
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
  method: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Bank Transfer', 'Cash', 'Online Wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  // For Bank Transfer
  bankTransferDetails: {
    receiptImage: String, // URL to uploaded image
    transactionReference: String,
    bankName: String,
    transferDate: Date,
    uploadDate: Date
  },
  // For Cash
  cashDetails: {
    receivedBy: String,
    receiptNumber: String,
    receivedDate: Date
  },
  // Verification
  verifiedBy: String,
  verifiedDate: Date,
  verificationNotes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);