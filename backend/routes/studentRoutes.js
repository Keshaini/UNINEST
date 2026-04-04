const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, authorizeAdmin, studentController.getAllStudents);
router.put('/warning/acknowledge', protect, studentController.acknowledgeWarning);
router.get('/profile', protect, studentController.getProfile);
router.put('/profile', protect, studentController.updateProfile);
router.get('/room', protect, studentController.getRoom);
router.get('/payments', protect, studentController.getPayments);
router.get('/complaints', protect, studentController.getComplaints);
router.put('/:id/status', protect, authorizeAdmin, studentController.updateStudentStatus);
router.put('/:id/warning', protect, authorizeAdmin, studentController.updateStudentWarning);
router.put('/:id/restore', protect, authorizeAdmin, studentController.restoreStudent);
router.put('/:id', protect, authorizeAdmin, studentController.updateStudentByAdmin);
router.delete('/:id/permanent', protect, authorizeAdmin, studentController.deleteStudentPermanently);
router.delete('/:id', protect, authorizeAdmin, studentController.deleteStudent);

module.exports = router;
