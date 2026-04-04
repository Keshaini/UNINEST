const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
});

// Get single invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    let { roomFee, securityDeposit, utilities, otherFees } = req.body;

    // ✅ Convert to numbers safely
    roomFee = Number(roomFee) || 0;
    securityDeposit = Number(securityDeposit) || 0;
    utilities = Number(utilities) || 0;
    otherFees = Number(otherFees) || 0;

    const items = [
      { description: 'Room Fee', amount: roomFee },
      { description: 'Security Deposit', amount: securityDeposit },
      { description: 'Utilities', amount: utilities },
      { description: 'Other Fees', amount: otherFees }
    ];

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

    const invoiceData = {
      ...req.body,
      items,
      subtotal
    };

    const invoice = await Invoice.create(invoiceData);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });

  } catch (error) {
    console.error('❌ FULL ERROR:', error);

    res.status(400).json({   // 👈 change to 400 for validation clarity
      success: false,
      message: 'Validation failed',
      error: error.message
    });
  }
});

module.exports = router;