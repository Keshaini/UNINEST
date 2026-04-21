const mongoose = require("mongoose");
const Booking = require("../models/booking");

const parsePositiveInteger = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
};

// CREATE booking
exports.createBooking = async (req, res) => {
  try {
    const durationMonths = parsePositiveInteger(req.body.durationMonths || req.body.duration);
    if (!durationMonths) {
      return res.status(400).json({ error: "Duration must be a whole number greater than 0." });
    }

    const bedsRequested = parsePositiveInteger(req.body.bedsRequested || 1);
    if (!bedsRequested) {
      return res.status(400).json({ error: "Beds requested must be a whole number greater than 0." });
    }

    const payload = {
      ...req.body,
      name: req.body.name || req.body.fullName,
      checkIn: req.body.checkIn || req.body.moveInDate,
      duration: durationMonths,
      durationMonths,
      bedsRequested,
    };

    const db = mongoose.connection.db;
    const roomsCollection = db.collection('rooms');
    const { ObjectId } = require('mongodb');

    if (req.body.hostelId) {
      // Fetch room via raw driver to avoid Mongoose validator issues
      let room;
      try {
        room = await roomsCollection.findOne({ _id: new ObjectId(req.body.hostelId) });
      } catch (e) {
        room = null;
      }

      if (!room) {
        return res.status(404).json({ error: "Selected hostel not found." });
      }

      const currentBeds = Number(room.bedsAvailable) || 0;
      if (bedsRequested > currentBeds) {
        return res.status(400).json({ error: "Requested bed count exceeds available beds." });
      }

      // Save booking to MongoDB
      const booking = new Booking(payload);
      await booking.save();

      // Update room availability using raw driver (bypass Atlas validators)
      const newBeds = Math.max(0, currentBeds - bedsRequested);
      const newStatus = newBeds === 0 ? "Full" : room.status || "Open";
      await roomsCollection.updateOne(
        { _id: new ObjectId(req.body.hostelId) },
        { $set: { bedsAvailable: newBeds, status: newStatus, updatedAt: new Date() } }
      );

      return res.status(201).json(booking);

    } else if (req.body.roomNumber) {
      const booking = new Booking(payload);
      await booking.save();

      await roomsCollection.updateOne(
        { roomNumber: req.body.roomNumber },
        { $set: { status: "Occupied", updatedAt: new Date() } }
      );

      return res.status(201).json(booking);
    }

    return res.status(400).json({ error: "hostelId or roomNumber is required for booking." });
  } catch (err) {
    console.error("❌ Booking error:", err.message);
    res.status(500).json({ error: err.message });
  }
};