const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true },
    feeType: { type: String, enum: ['Hostel Fee', 'Mess Fee', 'Fine', 'Damage'], required: true },
    paymentMonth: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
    paymentMethod: { type: String, enum: ['Card', 'UPI', 'Bank Transfer', 'Cash'] },
    transactionId: { type: String, sparse: true },
    dueDate: { type: Date },
    paidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
