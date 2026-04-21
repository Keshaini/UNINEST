const mongoose = require('mongoose');

const HostelFeeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    transactionId: { type: String },
    paidAt: { type: Date }
});

module.exports = mongoose.model('HostelFee', HostelFeeSchema);
