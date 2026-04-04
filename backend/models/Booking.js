const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },
  fullName: String,
  email: String,
  phone: String,
  campusId: String,
  moveInDate: Date,
  durationMonths: {
    type: Number,
    min: 1,
  },
  bedsRequested: {
    type: Number,
    default: 1,
    min: 1,
  },
  name: String,
  studentId: String,
  roomNumber: String,
  checkIn: Date,
  duration: Number,
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);