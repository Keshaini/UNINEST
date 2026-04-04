const Complaint = require('../models/Complaint');

exports.submitComplaint = async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ msg: 'Only students can submit complaints' });
        }

        const { category, title, description } = req.body;
        const complaint = new Complaint({
            studentId: req.user.profileId, // ID from valid token
            category,
            title,
            description
        });

        await complaint.save();
        res.status(201).json(complaint);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'Student') {
            filter.studentId = req.user.profileId;
        }
        const complaints = await Complaint.find(filter).populate('studentId');
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

        complaint.status = status;
        if (adminResponse) complaint.adminResponse = adminResponse;
        if (status === 'Resolved') complaint.resolvedAt = Date.now();

        await complaint.save();
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};
