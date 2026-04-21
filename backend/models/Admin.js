const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employeeId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    roleLevel: { type: String, enum: ['SuperAdmin', 'Warden', 'Manager'], default: 'Warden' },
    contactNumber: { type: String },
    department: { type: String },
    profilePic: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);
