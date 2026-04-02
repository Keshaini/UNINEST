const Room = require("../models/Room");

const normalizeRoomPayload = (payload = {}) => {
  const roomNumber = payload.roomNumber || payload._id;

  return {
    roomNumber,
    name: payload.name || payload.roomName || payload.type || `Hostel ${roomNumber || ""}`.trim(),
    location: payload.location || "",
    type: payload.type || payload.hostelType || "Mixed Hostel",
    status: payload.status || "Open",
    price: Number(payload.price) || 0,
    bedsAvailable: Number(payload.bedsAvailable) || 0,
    hostelType: payload.hostelType || payload.type || "Mixed Hostel",
    nearUniversity: Boolean(payload.nearUniversity),
    mealPlanIncluded: Boolean(payload.mealPlanIncluded),
    maxResidentsPerRoom: Number(payload.maxResidentsPerRoom) || 1,
    stayPeriodLabel: payload.stayPeriodLabel || "Any",
    features: Array.isArray(payload.features) ? payload.features : [],
    image: payload.image || "/api/placeholder/400/250",
    rating: Number(payload.rating) || 8.0,
    reviews: Number(payload.reviews) || 0,
  };
};

// GET all rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE room
exports.createRoom = async (req, res) => {
  try {
    const payload = normalizeRoomPayload(req.body);
    const createdRoom = await Room.create(payload);
    res.status(201).json(createdRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE room
exports.updateRoom = async (req, res) => {
  try {
    const existingRoom = await Room.findById(req.params.id);

    if (!existingRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    const mergedPayload = normalizeRoomPayload({ ...existingRoom.toObject(), ...req.body });
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, mergedPayload, {
      new: true,
      runValidators: true,
    });

    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE room
exports.deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);

    if (!deletedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};