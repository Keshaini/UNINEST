const mongoose = require('mongoose');
const chatMessageSchema = require('./chatMessageSchema');

const complaintSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, trim: true, maxlength: 100 },
    studentName: { type: String, trim: true, maxlength: 120 },
    roomNumber: { type: String, trim: true, maxlength: 50 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, enum: ['maintenance', 'cleaning', 'security', 'utilities', 'general'], default: 'general', lowercase: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium', lowercase: true },
    status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'rejected'], default: 'pending', lowercase: true },
    supportNotes: { type: String, trim: true, default: '', maxlength: 2000 },
    assignedTo: { type: String, trim: true, default: '', maxlength: 120 },
    resolvedAt: { type: Date, default: null },
    chatMessages: { type: [chatMessageSchema], default: [] },
  },
  { timestamps: true }
);

complaintSchema.index({ studentId: 1, createdAt: -1 });
complaintSchema.index({ status: 1, priority: 1, createdAt: -1 });
complaintSchema.index({ category: 1, createdAt: -1 });

module.exports = complaintSchema;
