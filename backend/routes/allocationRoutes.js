const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

// Student requests room
router.post('/request', protect, allocationController.requestRoom);

// Get allocations (students see theirs, admin sees all)
router.get('/', protect, allocationController.getAllocations);

// Admin allocation operations
router.post('/', protect, authorizeAdmin, allocationController.allocateRoom);
router.put('/:id/approve', protect, authorizeAdmin, allocationController.approveAllocation);
router.put('/:id/reject', protect, authorizeAdmin, allocationController.rejectAllocation);

// Vacate room
router.put('/:id/vacate', protect, authorizeAdmin, allocationController.deallocateRoom);

module.exports = router;
