const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  discountCode: {
    type: String,
    unique: true
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: String,
  type: {
    type: String,
    enum: ['scholarship', 'early_payment', 'sibling', 'merit', 'custom'],
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  fixedAmount: {
    type: Number,
    default: 0
  },
  description: String,
  validFrom: {
    type: Date,
    default: Date.now
  },
  validTo: Date,
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Disabled'],
    default: 'Active'
  },
  usageLimit: {
    type: Number,
    default: null // null = unlimited
  },
  usageCount: {
    type: Number,
    default: 0
  },
  applicableCategories: [{
    type: String,
    enum: ['Room Fee', 'Security Deposit', 'Utilities', 'Other Fees']
  }],
  createdBy: String,
  approvedBy: String,
  approvalDate: Date
}, {
  timestamps: true
});

// Auto-generate discount code
discountSchema.pre('save', async function(next) {
  if (!this.discountCode) {
    const prefix = this.type.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.discountCode = `${prefix}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Discount', discountSchema);