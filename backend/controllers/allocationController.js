const Allocation = require('../models/Allocation');
const Room = require('../models/Room');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// Student requests a room
exports.requestRoom = async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ msg: 'Only students can request rooms' });
        }

        const studentId = req.user.profileId;
        const { roomId, remarks } = req.body;

        // Check if student already has a pending or active allocation
        const existingAllocation = await Allocation.findOne({
            studentId,
            status: { $in: ['Pending', 'Active'] }
        });

        if (existingAllocation) {
            return res.status(400).json({ msg: 'You already have an active or pending room request' });
        }

        const room = await Room.findById(roomId);
        if (!room || room.status !== 'Available' || room.currentOccupancy >= room.capacity) {
            return res.status(400).json({ msg: 'Room is full or unavailable' });
        }

        const allocation = new Allocation({
            studentId,
            roomId,
            remarks,
            status: 'Pending'
        });

        await allocation.save();
        res.status(201).json(allocation);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

// Admin approves room request
exports.approveAllocation = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const allocationId = req.params.id;
        const allocation = await Allocation.findById(allocationId).session(session);

        if (!allocation || allocation.status !== 'Pending') {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'Pending request not found' });
        }

        const room = await Room.findById(allocation.roomId).session(session);
        if (!room || room.status !== 'Available' || room.currentOccupancy >= room.capacity) {
            await session.abortTransaction();
            return res.status(400).json({ msg: 'Room is no longer available' });
        }

        allocation.status = 'Active';
        allocation.allocatedBy = req.user.profileId;
        await allocation.save({ session });

        room.currentOccupancy += 1;
        if (room.currentOccupancy >= room.capacity) {
            room.status = 'Full';
        }
        await room.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ msg: 'Room allocation approved', allocation });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

// Admin rejects room request
exports.rejectAllocation = async (req, res) => {
    try {
        const allocationId = req.params.id;
        const allocation = await Allocation.findById(allocationId);

        if (!allocation || allocation.status !== 'Pending') {
            return res.status(404).json({ msg: 'Pending request not found' });
        }

        allocation.status = 'Rejected';
        allocation.allocatedBy = req.user.profileId; // admin who rejected
        await allocation.save();

        res.json({ msg: 'Room allocation rejected', allocation });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

// Admin allocates a room directly (Legacy or direct assignment)
exports.allocateRoom = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { studentId, roomId, remarks } = req.body;

        const room = await Room.findById(roomId).session(session);
        if (!room || room.status !== 'Available' || room.currentOccupancy >= room.capacity) {
            await session.abortTransaction();
            return res.status(400).json({ msg: 'Room is full or unavailable' });
        }

        const student = await Student.findById(studentId).session(session);
        if (!student) {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'Student not found' });
        }

        const existingAllocation = await Allocation.findOne({ studentId, status: { $in: ['Active', 'Pending'] } }).session(session);
        if (existingAllocation) {
            await session.abortTransaction();
            return res.status(400).json({ msg: 'Student already has an active or pending allocation' });
        }

        const allocation = new Allocation({
            studentId,
            roomId,
            allocatedBy: req.user.profileId,
            remarks,
            status: 'Active'
        });

        await allocation.save({ session });

        room.currentOccupancy += 1;
        if (room.currentOccupancy >= room.capacity) {
            room.status = 'Full';
        }
        await room.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(allocation);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

// Admin or Student deallocates (or Vacates)
exports.deallocateRoom = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const allocation = await Allocation.findById(req.params.id).session(session);
        if (!allocation || allocation.status !== 'Active') {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'Active allocation not found' });
        }

        const room = await Room.findById(allocation.roomId).session(session);
        if (!room) {
            await session.abortTransaction();
            return res.status(404).json({ msg: 'Room not found' });
        }

        allocation.status = 'Vacated';
        allocation.endDate = Date.now();
        await allocation.save({ session });

        if (room.currentOccupancy > 0) {
            room.currentOccupancy -= 1;
        }

        if (room.status === 'Full' && room.currentOccupancy < room.capacity) {
            room.status = 'Available';
        }

        await room.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ msg: 'Room vacated successfully', allocation });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.getAllocations = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'Student') {
            filter.studentId = req.user.profileId;
        }

        const allocations = await Allocation.find(filter)
            .populate('studentId', 'firstName lastName registrationNumber')
            .populate('roomId', 'roomNumber type')
            .populate('allocatedBy', 'firstName lastName');
        res.json(allocations);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};
