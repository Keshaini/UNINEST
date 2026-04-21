const fs = require('fs');
const Complaint = require('../../models/Complaint');
const { VALID_CATEGORIES, VALID_PRIORITIES } = require('./constants');
const { normalizeEnum, normalizeString } = require('./utils');

const toEvidenceImage = (file) => ({
  url: `/uploads/complaint-evidence/${file.filename}`,
  name: normalizeString(file.originalname),
});

const normalizeEvidenceImages = (files = []) => files.filter((file) => file?.filename).map(toEvidenceImage);

const removeUploadedFiles = async (files = []) => {
  const uploadPaths = files.map((file) => file?.path).filter(Boolean);
  await Promise.all(uploadPaths.map((filePath) => fs.promises.unlink(filePath).catch(() => {})));
};

const createComplaint = async (req, res) => {
  try {
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    const studentId = normalizeString(req.body.studentId);
    const studentName = normalizeString(req.body.studentName);
    const roomNumber = normalizeString(req.body.roomNumber);
    const title = normalizeString(req.body.title);
    const description = normalizeString(req.body.description);
    const category = normalizeEnum(req.body.category, VALID_CATEGORIES);
    const priority = normalizeEnum(req.body.priority, VALID_PRIORITIES);

    if (!studentId || !studentName || !roomNumber || !title || !description) {
      await removeUploadedFiles(uploadedFiles);
      return res.status(400).json({
        success: false,
        message: 'studentId, studentName, roomNumber, title, and description are required.',
      });
    }

    if (!category) {
      await removeUploadedFiles(uploadedFiles);
      return res.status(400).json({
        success: false,
        message: `Category is required and must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    if (!priority) {
      await removeUploadedFiles(uploadedFiles);
      return res.status(400).json({
        success: false,
        message: `Priority is required and must be one of: ${VALID_PRIORITIES.join(', ')}`,
      });
    }

    const evidenceImages = normalizeEvidenceImages(uploadedFiles);

    const complaintData = {
      studentId,
      studentName,
      roomNumber,
      title,
      description,
      category,
      priority,
      evidenceImages,
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
    await removeUploadedFiles(Array.isArray(req.files) ? req.files : []);
    return res.status(500).json({ success: false, message: 'Failed to create complaint.', error: error.message });
  }
};

module.exports = createComplaint;
