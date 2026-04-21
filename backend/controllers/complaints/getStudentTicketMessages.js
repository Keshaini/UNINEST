const { getStudentTicket, toSortedTicketMessages } = require('./studentTicketHelpers');

const getStudentTicketMessages = async (req, res) => {
  try {
    const { complaint, error, status } = await getStudentTicket(req.params.id, req.params.studentId);
    if (error) return res.status(status).json({ success: false, message: error });

    const messages = toSortedTicketMessages(String(complaint._id), complaint.chatMessages);

    return res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch ticket messages.', error: error.message });
  }
};

module.exports = getStudentTicketMessages;
