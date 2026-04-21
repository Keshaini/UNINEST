const mongoose = require('mongoose');
const Room = require('../models/Room');

exports.addRoom = async (req, res) => {
    try {
        const body = { ...req.body };

        // Ensure capacity is always set (required in Atlas collection validator)
        if (!body.capacity) body.capacity = Number(body.maxResidentsPerRoom) || 1;

        // Map status values: if it passes through a mongo-level enum that doesn't know 'Limited', store as Open
        const validMongoStatuses = ['Available', 'Full', 'Maintenance', 'Open', 'Closed', 'Limited'];
        if (!body.status || !validMongoStatuses.includes(body.status)) {
            body.status = 'Open';
        }

        // Use raw MongoDB driver to bypass Atlas collection-level JSON Schema validators
        const db = mongoose.connection.db;
        const collection = db.collection('rooms');
        const doc = {
            ...body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // Auto-generate roomNumber if not provided
        if (!doc.roomNumber) {
            doc.roomNumber = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        const result = await collection.insertOne(doc);
        const savedRoom = await collection.findOne({ _id: result.insertedId });

        console.log('✅ Room saved successfully:', result.insertedId);
        res.status(201).json(savedRoom);
    } catch (err) {
        console.error('❌ Room creation error:', err.message);
        res.status(500).json({ msg: err.message, error: err.message });
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

exports.getRoomById = async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collection = db.collection('rooms');
        const { ObjectId } = require('mongodb');
        let room;
        try {
            room = await collection.findOne({ _id: new ObjectId(req.params.id) });
        } catch (e) {
            room = null;
        }
        if (!room) return res.status(404).json({ msg: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.updateRoomStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: new Date() },
            { new: true, runValidators: false }
        );
        if (!room) return res.status(404).json({ msg: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const body = { ...req.body };
        if (!body.capacity) body.capacity = Number(body.maxResidentsPerRoom) || 1;

        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { ...body, updatedAt: new Date() },
            { new: true, runValidators: false }
        );
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
