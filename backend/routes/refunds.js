const express = require('express');
const router = express.Router();
const {
  requestRefund,
  getAllRefunds,
  getRefundById,
  processRefund
} = require('../controllers/refundController');

// Student routes
router.post('/', requestRefund);
router.get('/my-refunds', getAllRefunds);
router.get('/:id', getRefundById);

// Admin routes
router.get('/', getAllRefunds);
router.put('/:id/process', processRefund);

module.exports = router;