const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    targetAudience: { type: String, enum: ['All', 'Students', 'Staff'], default: 'All' },
    priority: { type: String, enum: ['Low', 'Normal', 'High'], default: 'Normal' },
    isPinned: { type: Boolean, default: false },
    expiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Notice', NoticeSchema);
