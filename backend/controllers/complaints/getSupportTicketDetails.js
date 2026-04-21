const { getTicketById } = require('./studentTicketHelpers');

const getSupportTicketDetails = async (req, res) => {
  try {
    const { complaint, error, status } = await getTicketById(req.params.id);
    if (error) return res.status(status).json({ success: false, message: error });

    return res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch support ticket details.', error: error.message });
  }
};

module.exports = getSupportTicketDetails;
