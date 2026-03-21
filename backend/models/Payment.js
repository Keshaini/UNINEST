const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Bank Transfer', 'Online Wallet'],
    required: true
  },
  
  // Card Details (last 4 digits only - for display)
  cardLastFour: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Completed'
  },
  
  // Receipt
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Dates
  paymentDate: {
    type: Date,
    default: Date.now
  },
  
  // Additional Info
  remarks: {
    type: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate transaction and receipt numbers
paymentSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  if (!this.receiptNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Payment').countDocuments();
    this.receiptNumber = `REC-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);