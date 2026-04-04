const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeAdmin, noticeController.postNotice);
router.get('/', protect, noticeController.getNotices);

module.exports = router;
