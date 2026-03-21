const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
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
  studentId: {
    type: String,
    required: true
  },
  
  // Invoice Items
  items: [{
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  
  // Amounts
  roomFee: {
    type: Number,
    required: true,
    default: 50000
  },
  securityDeposit: {
    type: Number,
    required: true,
    default: 25000
  },
  utilities: {
    type: Number,
    default: 8000
  },
  otherFees: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  discountPercentage: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  outstandingBalance: {
    type: Number,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid', 'Overdue'],
    default: 'Unpaid'
  },
  
  // Dates
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  
  // Additional Info
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate outstanding balance
  this.outstandingBalance = this.totalAmount - this.amountPaid;
  
  // Update status based on payment
  if (this.amountPaid === 0) {
    this.status = new Date() > this.dueDate ? 'Overdue' : 'Unpaid';
  } else if (this.amountPaid >= this.totalAmount) {
    this.status = 'Paid';
  } else {
    this.status = 'Partially Paid';
  }
  
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);