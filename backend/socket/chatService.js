const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const { notifyStudentAboutSupportMessage } = require('../controllers/complaints/notificationHelpers');

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(normalizeString(value));
const isValidRole = (role) => ['student', 'support'].includes(normalizeString(role).toLowerCase());

const toClientMessage = (ticketId, message) => ({
  _id: message._id,
  ticketId,
  senderRole: message.senderRole,
  senderName: message.senderName,
  message: message.message,
  imageUrl: message.imageUrl || '',
  imageName: message.imageName || '',
  sentAt: message.sentAt,
});

const validateAccess = ({ complaint, participantRole, studentId }) => {
  if (participantRole === 'support') {
    return { ok: true };
  }
  const normalizedStudentId = normalizeString(studentId);
  if (!normalizedStudentId) {
    return { ok: false, message: 'studentId is required for student chat access.' };
  }
  if (complaint.studentId !== normalizedStudentId) {
    return { ok: false, message: 'You can only access your own ticket chat.' };
  }
  return { ok: true };
};

const loadComplaint = async (ticketId) => {
  const normalizedTicketId = normalizeString(ticketId);
  if (!isValidObjectId(normalizedTicketId)) {
    return { complaint: null, error: 'Invalid ticket ID.' };
  }

  const complaint = await Complaint.findById(normalizedTicketId);
  if (!complaint) {
    return { complaint: null, error: 'Ticket not found.' };
  }

  return { complaint, error: '' };
};

const appendMessage = async ({ complaint, ticketId, participantRole, senderName, message }) => {
  complaint.chatMessages.push({
    senderRole: participantRole,
    senderName: normalizeString(senderName) || (participantRole === 'student' ? complaint.studentId : 'Support Team'),
    message: normalizeString(message),
    sentAt: new Date(),
  });

  await complaint.save();
  const savedMessage = complaint.chatMessages[complaint.chatMessages.length - 1];
  if (participantRole === 'support') {
    await notifyStudentAboutSupportMessage(complaint, savedMessage).catch(() => {});
  }
  return toClientMessage(ticketId, savedMessage);
};

module.exports = {
  normalizeString,
  isValidRole,
  validateAccess,
  loadComplaint,
  appendMessage,
};
