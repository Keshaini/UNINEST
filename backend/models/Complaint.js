const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    category: { type: String, enum: ['Electrical', 'Plumbing', 'Cleaning', 'Internet', 'Other'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Rejected'], default: 'Open' },
    assignedTo: { type: String },
    adminResponse: { type: String },
    resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
