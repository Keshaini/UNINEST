const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    senderRole: { type: String, enum: ['student', 'support'], required: true, lowercase: true },
    senderName: { type: String, trim: true, maxlength: 120, default: '' },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

module.exports = chatMessageSchema;
