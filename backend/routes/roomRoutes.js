const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeAdmin, roomController.addRoom);
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.put('/:id/status', protect, authorizeAdmin, roomController.updateRoomStatus);
router.put('/:id', protect, authorizeAdmin, roomController.updateRoom);
router.delete('/:id', protect, authorizeAdmin, roomController.deleteRoom);

module.exports = router;
