const Complaint = require('../../models/Complaint');
const { buildComplaintFilter } = require('./buildFilter');
const { toPositiveInt } = require('./utils');

const listComplaints = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 10), 100);
    const skip = (page - 1) * limit;
    const sortOrder = req.query.sort === 'oldest' ? 1 : -1;
    const { filter, error } = buildComplaintFilter(req.query);

    if (error) return res.status(400).json({ success: false, message: error });

    const [items, total] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: sortOrder }).skip(skip).limit(limit),
      Complaint.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch complaints.', error: error.message });
  }
};

module.exports = listComplaints;
