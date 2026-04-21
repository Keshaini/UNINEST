const express = require('express');
const {
  createComplaint,
  getAllComplaints,
  getComplaintStats,
  getComplaintById,
  getComplaintsByStudent,
  getStudentTicketDetails,
  getStudentTicketMessages,
  sendStudentTicketMessage,
  getSupportTicketDetails,
  getSupportTicketMessages,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Student complaint routes (protected routes for students)
router.post('/student/submit', protect, createComplaint);
router.get('/student/history/:studentId', protect, getComplaintsByStudent);
router.get('/student/ticket/:id/full-view/:studentId', protect, getStudentTicketDetails);
router.get('/student/ticket/:id/messages/:studentId', protect, getStudentTicketMessages);
router.post('/student/ticket/:id/messages/:studentId/send', protect, sendStudentTicketMessage);

// Support complaint routes (admin protected routes)
router.get('/support/all', protect, authorizeAdmin, getAllComplaints);
router.get('/support/overview-stats', protect, authorizeAdmin, getComplaintStats);
router.get('/support/ticket/:id/full-view', protect, authorizeAdmin, getSupportTicketDetails);
router.get('/support/ticket/:id/messages', protect, authorizeAdmin, getSupportTicketMessages);
router.patch('/support/update/:id', protect, authorizeAdmin, updateComplaint);
router.delete('/support/remove/:id', protect, authorizeAdmin, deleteComplaint);

// Shared complaint route
router.get('/record/:id', protect, getComplaintById);

module.exports = router;
