const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, complaintController.submitComplaint);
router.get('/', protect, complaintController.getComplaints);
router.put('/:id/status', protect, authorizeAdmin, complaintController.updateComplaintStatus);

module.exports = router;
