const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, paymentController.recordPayment);
router.get('/', protect, paymentController.getPayments);
router.put('/:id', protect, authorizeAdmin, paymentController.updatePaymentStatus);

module.exports = router;
