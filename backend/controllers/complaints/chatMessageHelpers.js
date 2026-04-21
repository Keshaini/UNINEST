const fs = require('fs');
const { getIo } = require('../../socket/socketStore');
const { toTicketMessage } = require('./studentTicketHelpers');
const { normalizeChatMessage, normalizeString } = require('./utils');

const MAX_CHAT_MESSAGE_LENGTH = 2000;

const normalizeChatAttachment = (file) => {
  if (!file?.filename) {
    return { imageUrl: '', imageName: '' };
  }

  return {
    imageUrl: `/uploads/complaint-chat/${file.filename}`,
    imageName: normalizeString(file.originalname),
  };
};

const removeUploadedFile = async (file) => {
  if (!file?.path) return;
  await fs.promises.unlink(file.path).catch(() => {});
};

const validateChatSubmission = ({ message, file }) => {
  const normalizedMessage = normalizeChatMessage(message);

  if (!normalizedMessage && !file) {
    return { error: 'Message or image is required.', message: '' };
  }

  if (normalizedMessage.length > MAX_CHAT_MESSAGE_LENGTH) {
    return {
      error: `Message must be ${MAX_CHAT_MESSAGE_LENGTH} characters or fewer.`,
      message: normalizedMessage,
    };
  }

  return { error: '', message: normalizedMessage };
};

const createChatMessage = ({ complaint, senderRole, senderName, message, file }) => {
  const attachment = normalizeChatAttachment(file);
  return {
    senderRole,
    senderName: normalizeString(senderName) || (senderRole === 'student' ? complaint.studentName || complaint.studentId : 'Support Team'),
    message,
    imageUrl: attachment.imageUrl,
    imageName: attachment.imageName,
    sentAt: new Date(),
  };
};

const emitTicketMessage = (ticketId, savedMessage) => {
  const io = getIo();
  if (!io) return;

  io.to(`ticket:${ticketId}`).emit('ticket:message', {
    ticketId,
    message: toTicketMessage(ticketId, savedMessage),
  });
};

module.exports = {
  MAX_CHAT_MESSAGE_LENGTH,
  createChatMessage,
  emitTicketMessage,
  removeUploadedFile,
  validateChatSubmission,
};
