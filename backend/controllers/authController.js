const User = require('../models/User');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const payload = { user: { id: user.id, role: user.role, profileId: user.profileId } };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.registerStudent = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, registrationNumber, gender, contactNumber, course, batchYear } = req.body;
        
        // Email validation
        if (!email || !email.trim()) {
            return res.status(400).json({ msg: 'Email is required' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ msg: 'Invalid email format' });
        }

        // Strict name validation
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!firstName || !nameRegex.test(firstName.trim())) {
            return res.status(400).json({ msg: 'Name must contain only letters and spaces' });
        }
        if (lastName && lastName.trim() !== '' && !nameRegex.test(lastName.trim())) {
            return res.status(400).json({ msg: 'Name must contain only letters and spaces' });
        }

        // Strict year validation
        const currentYear = new Date().getFullYear();
        const parsedYear = parseInt(batchYear, 10);
        if (isNaN(parsedYear) || parsedYear > currentYear) {
            return res.status(400).json({ msg: 'Year cannot be in the future' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists with this email' });

        let existingStudent = await Student.findOne({ registrationNumber });
        if (existingStudent) return res.status(400).json({ msg: 'Registration number already registered' });

        user = new User({ email, password, role: 'Student' });
        await user.save();

        const student = new Student({ userId: user._id, firstName, lastName, registrationNumber, gender, contactNumber, course, batchYear });
        await student.save();

        user.profileId = student._id;
        await user.save();

        res.json({ token: generateToken(user), user: { id: user._id, role: user.role, profileId: user.profileId } });
    } catch (err) {
        console.error('Student Registration Error:', err.message);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.registerAdmin = async (req, res, next) => {
    try {
        console.log('Admin Registration Request Body:', req.body);
        const { email, password, firstName, lastName, employeeId, roleLevel, department, role } = req.body;
        
        // Email validation
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: 'Email is required', msg: 'Email is required' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ success: false, message: 'Invalid email format', msg: 'Invalid email format' });
        }

        // Input validation
        if (!password || !firstName || !lastName || !employeeId) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: 'Admin already exists' });
        
        let existingAdmin = await Admin.findOne({ employeeId });
        if (existingAdmin) return res.status(400).json({ success: false, message: 'Admin already exists' });

        user = new User({ email, password, role: 'Admin' });
        await user.save(); // Password hashing happens here due to pre-save hook in User model

        const admin = new Admin({ userId: user._id, firstName, lastName, employeeId, roleLevel, department });
        await admin.save();

        user.profileId = admin._id;
        await user.save();

        res.json({ success: true, message: "Admin registered successfully", token: generateToken(user), user: { id: user._id, role: user.role, profileId: user.profileId } });
    } catch (err) {
        console.error('Admin Registration Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        if (!user.isActive) return res.status(403).json({ msg: 'Account disabled' });

        let profileData = null;
        if (user.role === 'Admin' && user.profileId) {
            profileData = await Admin.findById(user.profileId);
        } else if (user.role === 'Student' && user.profileId) {
            profileData = await Student.findById(user.profileId);
        }

        const name = profileData ? `${profileData.firstName} ${profileData.lastName}` : '';
        const profilePic = profileData && profileData.profilePic ? profileData.profilePic : '';

        res.json({ 
            token: generateToken(user), 
            user: { 
                id: user._id, 
                role: user.role, 
                profileId: user.profileId,
                name,
                email: user.email,
                profilePic
            } 
        });
    } catch (err) {
        res.status(500).send('Server Error: ' + err.message);
    }
};
