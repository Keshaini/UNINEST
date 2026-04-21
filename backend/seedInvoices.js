const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err);
    process.exit(1);
  });

// Define Invoice Schema (same as your model)
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  studentName: String,
  studentId: String,
  invoiceDate: { type: Date, default: Date.now },
  dueDate: Date,
  semester: String,
  academicYear: String,
  items: [{ description: String, amount: Number }],
  subtotal: Number,
  discount: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  totalAmount: Number,
  amountPaid: { type: Number, default: 0 },
  outstandingBalance: Number,
  status: { type: String, default: 'Unpaid' }
}, { timestamps: true });

// Pre-save hook
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const Invoice = mongoose.model('Invoice');
    const count = await Invoice.countDocuments();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  
  if (!this.dueDate) {
    this.dueDate = new Date(this.invoiceDate);
    this.dueDate.setDate(this.dueDate.getDate() + 30);
  }
  
  this.discount = (this.subtotal * this.discountPercentage) / 100;
  this.totalAmount = this.subtotal - this.discount;
  this.outstandingBalance = this.totalAmount - this.amountPaid;
  
  if (this.amountPaid >= this.totalAmount) {
    this.status = 'Paid';
  } else if (this.amountPaid > 0) {
    this.status = 'Partially Paid';
  } else if (new Date() > this.dueDate) {
    this.status = 'Overdue';
  } else {
    this.status = 'Unpaid';
  }
  
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

// Test data
const testInvoices = [
  {
    studentName: "Sarah Johnson",
    studentId: "IT23123456",
    semester: "Semester 1",
    academicYear: "2026",
    items: [
      { description: 'Room Fee', amount: 45000 },
      { description: 'Security Deposit', amount: 20000 },
      { description: 'Utilities', amount: 5000 },
      { description: 'Other Fees', amount: 3000 }
    ],
    subtotal: 73000,
    discountPercentage: 5
  },
  {
    studentName: "Michael Chen",
    studentId: "IT23789012",
    semester: "Semester 1",
    academicYear: "2026",
    items: [
      { description: 'Room Fee', amount: 50000 },
      { description: 'Security Deposit', amount: 25000 },
      { description: 'Utilities', amount: 6000 },
      { description: 'Other Fees', amount: 2500 }
    ],
    subtotal: 83500,
    discountPercentage: 10
  },
  {
    studentName: "Emily Williams",
    studentId: "IT23345678",
    semester: "Semester 2",
    academicYear: "2026",
    items: [
      { description: 'Room Fee', amount: 40000 },
      { description: 'Security Deposit', amount: 18000 },
      { description: 'Utilities', amount: 4500 },
      { description: 'Other Fees', amount: 2000 }
    ],
    subtotal: 64500,
    discountPercentage: 0
  }
];

// Create invoices
async function seedInvoices() {
  try {
    console.log('🗑️  Clearing existing invoices...');
    await Invoice.deleteMany({});
    
    console.log('📝 Creating test invoices...');
    
    for (let data of testInvoices) {
      const invoice = await Invoice.create(data);
      console.log(`✅ Created: ${invoice.invoiceNumber} - ${invoice.studentName} - LKR ${invoice.totalAmount.toLocaleString()}`);
    }
    
    console.log('\n🎉 Test data created successfully!');
    console.log(`📊 Total invoices: ${testInvoices.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedInvoices();