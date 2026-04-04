const Admin = require('../models/Admin');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ msg: 'Not authorized as an admin' });
        }

        const admin = await Admin.findById(req.user.profileId).populate('userId', 'email');
        
        if (!admin) {
            return res.status(404).json({ msg: 'Admin profile not found' });
        }
        
        res.json(admin);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ msg: 'Not authorized as an admin' });
        }

        const { firstName, lastName, department } = req.body;
        
        // Build an object with the updated fields
        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (department) updateFields.department = department;
        
        // if file was uploaded through multer, capture the path
        if (req.file) {
            updateFields.profilePic = `/uploads/${req.file.filename}`;
        }

        const admin = await Admin.findByIdAndUpdate(
            req.user.profileId,
            { $set: updateFields },
            { new: true }
        ).populate('userId', 'email');

        res.json(admin);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};
