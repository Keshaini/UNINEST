const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { registerAdmin } = require('../controllers/authController');
const { getProfile, updateProfile } = require('../controllers/adminProfileController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

// Set up Multer for handling file uploads (saving to "uploads")
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        // e.g., admin-12345678.jpg
        cb(null, `admin-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
    fileFilter(req, file, cb) {
        // check file types
        const filetypes = /jpg|jpeg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Images only (jpg, jpeg, png)!'));
        }
    }
});

router.post('/register', registerAdmin);
router.get('/profile', protect, authorizeAdmin, getProfile);
router.put('/profile', protect, authorizeAdmin, upload.single('profilePic'), updateProfile);

module.exports = router;
