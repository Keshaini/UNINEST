const Student = require('../models/Student');
const Allocation = require('../models/Allocation');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('userId', 'email isActive');
        res.json(students);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.updateStudentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const student = await Student.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('userId', 'email');
        res.json(student);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.updateStudentWarning = async (req, res) => {
    try {
        const { adminWarning } = req.body;
        // If it's a new warning string, reset acknowledged state
        const warningAcknowledged = adminWarning ? false : false;
        const student = await Student.findByIdAndUpdate(req.params.id, { adminWarning, warningAcknowledged }, { new: true }).populate('userId', 'email');
        res.json(student);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.acknowledgeWarning = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.user.profileId, { warningAcknowledged: true }, { new: true }).populate('userId', 'email');
        res.json(student);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, { status: 'Deleted' }, { new: true }).populate('userId', 'email');
        if (student && student.userId) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(student.userId, { isActive: false });
        }
        res.json({ msg: 'Student marked as Deleted', student });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.deleteStudentPermanently = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ msg: 'Student not found' });
        
        if (student.userId) {
            const User = require('../models/User');
            await User.findByIdAndDelete(student.userId);
        }
        
        // Also delete related records to avoid orphans
        await Allocation.deleteMany({ studentId: req.params.id });
        await Payment.deleteMany({ studentId: req.params.id });
        await Complaint.deleteMany({ studentId: req.params.id });
        
        await Student.findByIdAndDelete(req.params.id);
        
        res.json({ msg: 'Student and related records permanently deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.restoreStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, { status: 'Active' }, { new: true }).populate('userId', 'email');
        if (student && student.userId) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(student.userId, { isActive: true });
        }
        res.json({ msg: 'Student restored to Active', student });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.updateStudentByAdmin = async (req, res) => {
    try {
        const { firstName, lastName, contactNumber, course, batchYear, gender } = req.body;
        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
        if (course !== undefined) updateData.course = course;
        if (batchYear !== undefined && batchYear !== '') updateData.batchYear = batchYear;
        if (gender !== undefined) updateData.gender = gender;

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('userId', 'email');

        res.json(updatedStudent);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.profileId).populate('userId', 'email');
        if (!student) return res.status(404).json({ msg: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { profilePic, preferences, profileCompletion } = req.body;
        
        const updateData = {};
        if (profilePic !== undefined) updateData.profilePic = profilePic;
        if (preferences !== undefined) updateData.preferences = preferences;
        if (profileCompletion !== undefined) updateData.profileCompletion = profileCompletion;

        const updatedStudent = await Student.findByIdAndUpdate(
            req.user.profileId, 
            { $set: updateData }, 
            { new: true }
        ).populate('userId', 'email');
        
        res.json(updatedStudent);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.getRoom = async (req, res) => {
    try {
        const allocation = await Allocation.findOne({ studentId: req.user.profileId })
            .populate('roomId')
            .sort({ createdAt: -1 });
        
        if (!allocation) return res.json({ assigned: false, status: 'No Room Assigned' });
        res.json({ assigned: true, ...allocation._doc });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ studentId: req.user.profileId }).sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ studentId: req.user.profileId }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};
