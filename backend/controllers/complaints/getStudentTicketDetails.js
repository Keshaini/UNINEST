const { getStudentTicket } = require('./studentTicketHelpers');

const getStudentTicketDetails = async (req, res) => {
  try {
    const { complaint, error, status } = await getStudentTicket(req.params.id, req.params.studentId);
    if (error) return res.status(status).json({ success: false, message: error });

    return res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch ticket details.', error: error.message });
  }
};

module.exports = getStudentTicketDetails;
