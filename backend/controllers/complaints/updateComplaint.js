const Complaint = require('../../models/Complaint');
const { isValidObjectId, normalizeString } = require('./utils');
const { notifyStudentAboutComplaintUpdate } = require('./notificationHelpers');
const { applyComplaintUpdates, buildUpdatePayload } = require('./updateHelpers');

const updateComplaint = async (req, res) => {
  try {
    const complaintId = normalizeString(req.params.id);
    if (!isValidObjectId(complaintId)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID.' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    const { updates, error } = buildUpdatePayload(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    applyComplaintUpdates(complaint, updates);
    await complaint.save();
    await notifyStudentAboutComplaintUpdate(complaint, updates).catch(() => {});

    return res.status(200).json({ success: true, message: 'Complaint updated successfully.', data: complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update complaint.', error: error.message });
  }
};

module.exports = updateComplaint;
