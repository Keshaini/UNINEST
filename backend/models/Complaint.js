const mongoose = require('mongoose');
const complaintSchema = require('./complaint/complaintSchema');

module.exports = mongoose.model('Complaint', complaintSchema);
