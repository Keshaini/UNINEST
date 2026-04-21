const Complaint = require('../../models/Complaint');
const { isValidObjectId, normalizeString } = require('./utils');

const toTicketMessage = (ticketId, message) => ({
  _id: message._id,
  ticketId: normalizeString(ticketId),
  senderRole: message.senderRole,
  senderName: message.senderName,
  message: message.message,
  imageUrl: message.imageUrl || '',
  imageName: message.imageName || '',
  sentAt: message.sentAt,
});

const toSortedTicketMessages = (ticketId, chatMessages = []) =>
  [...chatMessages]
    .sort((firstMessage, secondMessage) => new Date(firstMessage.sentAt) - new Date(secondMessage.sentAt))
    .map((message) => toTicketMessage(ticketId, message));

const getTicketById = async (complaintId) => {
  const normalizedId = normalizeString(complaintId);
  if (!isValidObjectId(normalizedId)) return { error: 'Invalid complaint ID.', status: 400 };

  const complaint = await Complaint.findById(normalizedId);
  if (!complaint) return { error: 'Complaint not found.', status: 404 };

  return { complaint };
};

const getStudentTicket = async (complaintId, studentId) => {
  const normalizedStudentId = normalizeString(studentId);
  if (!normalizedStudentId) return { error: 'studentId is required.', status: 400 };

  const { complaint, error, status } = await getTicketById(complaintId);
  if (error) return { error, status };

  if (complaint.studentId !== normalizedStudentId) {
    return { error: 'You can only access your own ticket.', status: 403 };
  }

  return { complaint };
};

module.exports = { getTicketById, getStudentTicket, toTicketMessage, toSortedTicketMessages };
