const Complaint = require('../../models/Complaint');
const { isValidObjectId, normalizeString } = require('./utils');

const getComplaintById = async (req, res) => {
  try {
    const complaintId = normalizeString(req.params.id);
    if (!isValidObjectId(complaintId)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID.' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    return res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch complaint.', error: error.message });
  }
};

module.exports = getComplaintById;
