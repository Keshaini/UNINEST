const Complaint = require('../../models/Complaint');
const { VALID_STATUSES } = require('./constants');
const { normalizeEnum, normalizeString } = require('./utils');

const getComplaintsByStudent = async (req, res) => {
  try {
    const studentId = normalizeString(req.params.studentId);
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required.' });

    const filter = { studentId };
    if (req.query.status !== undefined) {
      const status = normalizeEnum(req.query.status, VALID_STATUSES);
      if (!status) {
        return res.status(400).json({ success: false, message: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}` });
      }
      filter.status = status;
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch student complaints.', error: error.message });
  }
};

module.exports = getComplaintsByStudent;
