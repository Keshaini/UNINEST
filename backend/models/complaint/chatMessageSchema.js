const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    senderRole: { type: String, enum: ['student', 'support'], required: true, lowercase: true },
    senderName: { type: String, trim: true, maxlength: 120, default: '' },
    message: { type: String, trim: true, maxlength: 2000, default: '' },
    imageUrl: { type: String, trim: true, maxlength: 500, default: '' },
    imageName: { type: String, trim: true, maxlength: 255, default: '' },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

module.exports = chatMessageSchema;
