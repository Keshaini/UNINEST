const Complaint = require('../../models/Complaint');
const { VALID_CATEGORIES, VALID_PRIORITIES } = require('./constants');
const { normalizeEnum, normalizeString } = require('./utils');

const createComplaint = async (req, res) => {
  try {
    const studentId = normalizeString(req.body.studentId);
    const studentName = normalizeString(req.body.studentName);
    const roomNumber = normalizeString(req.body.roomNumber);
    const title = normalizeString(req.body.title);
    const description = normalizeString(req.body.description);
    const category = normalizeEnum(req.body.category, VALID_CATEGORIES);
    const priority = normalizeEnum(req.body.priority, VALID_PRIORITIES);

    if (!studentId || !studentName || !roomNumber || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'studentId, studentName, roomNumber, title, and description are required.',
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Category is required and must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    if (!priority) {
      return res.status(400).json({
        success: false,
        message: `Priority is required and must be one of: ${VALID_PRIORITIES.join(', ')}`,
      });
    }

    const complaintData = {
      studentId,
      studentName,
      roomNumber,
      title,
      description,
      category,
      priority,
      chatMessages: [
        {
          senderRole: 'student',
          senderName: studentName,
          message: description,
          sentAt: new Date(),
        },
      ],
    };

    const complaint = await Complaint.create(complaintData);

    return res.status(201).json({ success: true, message: 'Complaint created successfully.', data: complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create complaint.', error: error.message });
  }
};

module.exports = createComplaint;
