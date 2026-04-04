const mongoose = require('mongoose');

const AllocationSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: { type: String, enum: ['Pending', 'Active', 'Vacated', 'Transferred', 'Rejected'], default: 'Pending' },
    remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Allocation', AllocationSchema);
