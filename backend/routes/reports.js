const express = require('express');
const router = express.Router();
const {
  getFinancialSummary,
  exportPayments,
  exportInvoices,
  getPaymentAnalytics
} = require('../controllers/reportController');


// Financial reports
router.get('/financial-summary', getFinancialSummary);
router.get('/analytics', getPaymentAnalytics);

// Excel exports
router.get('/export/payments', exportPayments);
router.get('/export/invoices', exportInvoices);

module.exports = router;