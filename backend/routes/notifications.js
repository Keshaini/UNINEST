const express = require('express');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const resolveAudienceKeys = async (authUser = {}) => {
  const keys = new Set();
  if (authUser.id) keys.add(String(authUser.id));
  if (authUser.profileId) keys.add(String(authUser.profileId));

  if (authUser.role === 'Admin') {
    keys.add('admin');
    return Array.from(keys);
  }

  if (authUser.role === 'Student' && authUser.profileId) {
    const student = await Student.findById(authUser.profileId).select('registrationNumber');
    if (student?.registrationNumber) keys.add(student.registrationNumber);
  }

  return Array.from(keys);
};

const buildAudienceFilter = (audienceKeys) => ({ userId: { $in: audienceKeys } });

router.get('/', protect, async (req, res) => {
  try {
    const { unreadOnly, limit = 20 } = req.query;
    const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
    const audienceKeys = await resolveAudienceKeys(req.user || {});

    const filter = buildAudienceFilter(audienceKeys);
    if (unreadOnly === 'true') filter.read = false;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(parsedLimit);
    const unreadCount = await Notification.countDocuments({ ...buildAudienceFilter(audienceKeys), read: false });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications.',
      error: error.message,
    });
  }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    const audienceKeys = await resolveAudienceKeys(req.user || {});
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...buildAudienceFilter(audienceKeys) },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification.',
      error: error.message,
    });
  }
});

router.put('/mark-all-read', protect, async (req, res) => {
  try {
    const audienceKeys = await resolveAudienceKeys(req.user || {});
    await Notification.updateMany({ ...buildAudienceFilter(audienceKeys), read: false }, { read: true, readAt: new Date() });
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read.',
      error: error.message,
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const audienceKeys = await resolveAudienceKeys(req.user || {});
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, ...buildAudienceFilter(audienceKeys) });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    return res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification.',
      error: error.message,
    });
  }
});

module.exports = router;
