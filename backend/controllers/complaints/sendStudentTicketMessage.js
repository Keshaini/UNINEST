const { getStudentTicket, toTicketMessage } = require('./studentTicketHelpers');
const { normalizeChatMessage, normalizeString } = require('./utils');

const MAX_CHAT_MESSAGE_LENGTH = 2000;

const sendStudentTicketMessage = async (req, res) => {
  try {
    const { complaint, error, status } = await getStudentTicket(req.params.id, req.params.studentId);
    if (error) return res.status(status).json({ success: false, message: error });

    const senderName = normalizeString(req.body.senderName);
    const message = normalizeChatMessage(req.body.message);
    if (!message) return res.status(400).json({ success: false, message: 'Message is required.' });
    if (message.length > MAX_CHAT_MESSAGE_LENGTH) {
      return res
        .status(400)
        .json({ success: false, message: `Message must be ${MAX_CHAT_MESSAGE_LENGTH} characters or fewer.` });
    }

    complaint.chatMessages.push({
      senderRole: 'student',
      senderName: senderName || complaint.studentName || complaint.studentId,
      message,
      sentAt: new Date(),
    });

    await complaint.save();
    const savedMessage = complaint.chatMessages[complaint.chatMessages.length - 1];

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: toTicketMessage(String(complaint._id), savedMessage),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send ticket message.', error: error.message });
  }
};

module.exports = sendStudentTicketMessage;
