const { getTicketById, toTicketMessage } = require('./studentTicketHelpers');
const { normalizeString } = require('./utils');
const {
  createChatMessage,
  emitTicketMessage,
  removeUploadedFile,
  validateChatSubmission,
} = require('./chatMessageHelpers');

const sendSupportTicketMessage = async (req, res) => {
  try {
    const { complaint, error, status } = await getTicketById(req.params.id);
    if (error) {
      await removeUploadedFile(req.file);
      return res.status(status).json({ success: false, message: error });
    }

    const senderName = normalizeString(req.body.senderName) || complaint.assignedTo || 'Support Team';
    const { error: validationError, message } = validateChatSubmission({
      message: req.body.message,
      file: req.file,
    });
    if (validationError) {
      await removeUploadedFile(req.file);
      return res.status(400).json({ success: false, message: validationError });
    }

    complaint.chatMessages.push(createChatMessage({
      complaint,
      senderRole: 'support',
      senderName,
      message,
      file: req.file,
    }));

    await complaint.save();
    const savedMessage = complaint.chatMessages[complaint.chatMessages.length - 1];
    emitTicketMessage(String(complaint._id), savedMessage);

    return res.status(201).json({
      success: true,
      message: 'Support message sent successfully.',
      data: toTicketMessage(String(complaint._id), savedMessage),
    });
  } catch (error) {
    await removeUploadedFile(req.file);
    return res.status(500).json({ success: false, message: 'Failed to send support message.', error: error.message });
  }
};

module.exports = sendSupportTicketMessage;
