const Booking = require("../models/booking");
const Room = require("../models/Room");

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

    if (req.body.hostelId) {
      const room = await Room.findById(req.body.hostelId);

      if (!room) {
        return res.status(404).json({ error: "Selected hostel not found." });
      }

      if (bedsRequested > (room.bedsAvailable || 0)) {
        return res.status(400).json({ error: "Requested bed count exceeds available beds." });
      }

      const booking = new Booking(payload);
      await booking.save();

      room.bedsAvailable = Math.max(0, (room.bedsAvailable || 0) - bedsRequested);
      room.status = room.bedsAvailable === 0 ? "Full" : room.status || "Open";
      await room.save();

      return res.status(201).json(booking);
    } else if (req.body.roomNumber) {
      const booking = new Booking(payload);
      await booking.save();

      // Keep legacy booking behavior for roomNumber payloads.
      await Room.findOneAndUpdate(
        { roomNumber: req.body.roomNumber },
        { status: "Occupied" }
      );

      return res.status(201).json(booking);
    }

    return res.status(400).json({ error: "hostelId or roomNumber is required for booking." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};