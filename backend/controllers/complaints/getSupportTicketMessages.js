const { getTicketById, toSortedTicketMessages } = require('./studentTicketHelpers');

const getSupportTicketMessages = async (req, res) => {
  try {
    const { complaint, error, status } = await getTicketById(req.params.id);
    if (error) return res.status(status).json({ success: false, message: error });

    const messages = toSortedTicketMessages(String(complaint._id), complaint.chatMessages);
    return res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch support ticket messages.', error: error.message });
  }
};

module.exports = getSupportTicketMessages;
