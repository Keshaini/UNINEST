const Notice = require('../models/Notice');

exports.postNotice = async (req, res) => {
    try {
        const { title, content, targetAudience, priority, isPinned, expiresAt } = req.body;
        const notice = new Notice({
            title,
            content,
            issuedBy: req.user.profileId, // Must be an admin
            targetAudience,
            priority,
            isPinned,
            expiresAt
        });

        await notice.save();
        res.status(201).json(notice);
    } catch (err) {
        console.error('postNotice error:', err);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.getNotices = async (req, res) => {
    try {
        let filter = {
            $or: [
                { expiresAt: { $gte: new Date() } },
                { expiresAt: null }
            ]
        };

        if (req.user.role === 'Student') {
            filter.targetAudience = { $in: ['All', 'Students'] };
        } else if (req.user.role === 'Admin') {
            filter.targetAudience = { $in: ['All', 'Staff'] };
        }

        const notices = await Notice.find(filter)
            .populate('issuedBy', 'firstName lastName')
            .sort({ isPinned: -1, createdAt: -1 });

        res.json(notices);
    } catch (err) {
        console.error('getNotices error:', err);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};
