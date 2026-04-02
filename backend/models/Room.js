const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: String,
  name: String,
  location: String,
  type: String,
  status: {
    type: String,
    default: "Available",
  },
  price: Number,
  bedsAvailable: {
    type: Number,
    default: 0,
  },
  hostelType: {
    type: String,
    default: "Mixed Hostel",
  },
  nearUniversity: {
    type: Boolean,
    default: false,
  },
  mealPlanIncluded: {
    type: Boolean,
    default: false,
  },
  maxResidentsPerRoom: {
    type: Number,
    default: 1,
  },
  stayPeriodLabel: {
    type: String,
    default: "Any",
  },
  features: {
    type: [String],
    default: [],
  },
  image: String,
  rating: {
    type: Number,
    default: 8.0,
  },
  reviews: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Room", roomSchema);