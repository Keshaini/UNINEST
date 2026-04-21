const Complaint = require('../../models/Complaint');
const { VALID_PRIORITIES, VALID_STATUSES } = require('./constants');

const getComplaintStats = async (_req, res) => {
  try {
    const [totalComplaints, openComplaints, resolvedComplaints, rejectedComplaints, statusCounts, priorityCounts, resolvedToday] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
        Complaint.countDocuments({ status: 'resolved' }),
        Complaint.countDocuments({ status: 'rejected' }),
        Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
        Complaint.countDocuments({ status: 'resolved', resolvedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      ]);

    const byStatus = VALID_STATUSES.reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
    const byPriority = VALID_PRIORITIES.reduce((acc, priority) => ({ ...acc, [priority]: 0 }), {});

    statusCounts.forEach((entry) => entry && byStatus[entry._id] !== undefined && (byStatus[entry._id] = entry.count));
    priorityCounts.forEach((entry) => entry && byPriority[entry._id] !== undefined && (byPriority[entry._id] = entry.count));

    return res.status(200).json({
      success: true,
      data: { totalComplaints, openComplaints, resolvedComplaints, rejectedComplaints, resolvedToday, byStatus, byPriority },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch complaint statistics.', error: error.message });
  }
};

module.exports = getComplaintStats;
