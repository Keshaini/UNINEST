const Room = require('../models/Room');

exports.addRoom = async (req, res) => {
    try {
        const newRoom = new Room(req.body);
        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.updateRoomStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const room = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!room) return res.status(404).json({ msg: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) return res.status(404).json({ msg: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ msg: 'Room not found' });
        res.json({ msg: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};
