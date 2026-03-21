const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// @route   GET /api/invoices
// @desc    Get all invoices for a student
// @access  Public (should be protected in production)
router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    
    const query = studentId ? { studentId } : {};
    const invoices = await Invoice.find(query).sort({ invoiceDate: -1 });
    
    res.json({
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

// @route   GET /api/invoices/:id
// @desc    Get single invoice by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.json({
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

// @route   POST /api/invoices
// @desc    Create new invoice (for testing/demo)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      studentName,
      studentId,
      roomFee,
      securityDeposit,
      utilities,
      otherFees,
      discount,
      discountPercentage,
      semester,
      academicYear,
      dueDate
    } = req.body;
    
    // Calculate amounts
    const subtotal = (roomFee || 50000) + (securityDeposit || 25000) + 
                     (utilities || 8000) + (otherFees || 0);
    const discountAmount = discount || (subtotal * (discountPercentage || 0) / 100);
    const totalAmount = subtotal - discountAmount;
    
    // Create items array
    const items = [
      { description: 'Monthly Room Fee', amount: roomFee || 50000 },
      { description: 'Security Deposit', amount: securityDeposit || 25000 },
      { description: 'Utilities', amount: utilities || 8000 }
    ];
    
    if (otherFees > 0) {
      items.push({ description: 'Other Fees', amount: otherFees });
    }
    
    const invoice = new Invoice({
      studentName,
      studentId,
      items,
      roomFee: roomFee || 50000,
      securityDeposit: securityDeposit || 25000,
      utilities: utilities || 8000,
      otherFees: otherFees || 0,
      subtotal,
      discount: discountAmount,
      discountPercentage: discountPercentage || 0,
      totalAmount,
      outstandingBalance: totalAmount,
      semester: semester || 'Semester 1',
      academicYear: academicYear || '2026',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    
    await invoice.save();
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
});

module.exports = router;