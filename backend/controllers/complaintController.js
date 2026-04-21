const createComplaint = require('./complaints/createComplaint');
const listComplaints = require('./complaints/listComplaints');
const getComplaintById = require('./complaints/getComplaintById');
const getComplaintsByStudent = require('./complaints/getComplaintsByStudent');
const updateComplaint = require('./complaints/updateComplaint');
const deleteComplaint = require('./complaints/deleteComplaint');
const getStudentTicketDetails = require('./complaints/getStudentTicketDetails');
const getStudentTicketMessages = require('./complaints/getStudentTicketMessages');
const sendStudentTicketMessage = require('./complaints/sendStudentTicketMessage');
const getSupportTicketDetails = require('./complaints/getSupportTicketDetails');
const getSupportTicketMessages = require('./complaints/getSupportTicketMessages');
const sendSupportTicketMessage = require('./complaints/sendSupportTicketMessage');
const getComplaintStats = require('./complaints/getComplaintStats');

module.exports = {
  createComplaint,
  getAllComplaints: listComplaints,
  getComplaintById,
  getComplaintsByStudent,
  updateComplaint,
  deleteComplaint,
  getStudentTicketDetails,
  getStudentTicketMessages,
  sendStudentTicketMessage,
  getSupportTicketDetails,
  getSupportTicketMessages,
  sendSupportTicketMessage,
  getComplaintStats,
};
