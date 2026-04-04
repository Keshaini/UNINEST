const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const Discount = require('../models/Discount');
const { 
  validateStudentId, 
  validateAmount, 
  validateFutureDate,
  sanitizeInput 
} = require('../utils/validators');

// Get all invoices (with filters and pagination)
const getAllInvoices = async (req, res) => {
  try {
    const { 
      status, 
      studentId, 
      startDate, 
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      if (!['Unpaid', 'Paid', 'Partially Paid', 'Overdue'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      filter.status = status;
    }
    
    if (studentId) {
      if (!validateStudentId(studentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID format'
        });
      }
      filter.studentId = studentId;
    }
    
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query with pagination
    const invoices = await Invoice.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(filter);

    // Calculate statistics
    const stats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' },
          totalOutstanding: { $sum: '$outstandingBalance' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: invoices.length,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      statistics: stats[0] || {
        totalAmount: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        count: 0
      },
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
};

// Get single invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID format'
      });
    }

    const invoice = await Invoice.findById(id);

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
};

// Create new invoice with validation
const createInvoice = async (req, res) => {
  try {
    const {
      studentName,
      studentId,
      roomFee,
      securityDeposit,
      utilities,
      otherFees,
      discountPercentage,
      semester,
      academicYear,
      dueDate,
      roomType,
      roomNumber
    } = req.body;

    // ========== VALIDATION ==========
    
    // Required fields
    if (!studentName || !studentId || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['studentName', 'studentId', 'semester', 'academicYear']
      });
    }

    // Sanitize text inputs
    const sanitizedStudentName = sanitizeInput(studentName);
    
    if (sanitizedStudentName.length < 2 || sanitizedStudentName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Student name must be between 2 and 100 characters'
      });
    }

    // Validate student ID
    if (!validateStudentId(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format. Expected format: IT23123456'
      });
    }

    // Validate amounts
    const amounts = { roomFee, securityDeposit, utilities, otherFees };
    for (const [key, value] of Object.entries(amounts)) {
      if (value !== undefined && value !== null) {
        if (!validateAmount(value)) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${key}. Must be between 0 and 1,000,000 LKR`
          });
        }
      }
    }

    // Validate discount percentage
    if (discountPercentage !== undefined && 
        (discountPercentage < 0 || discountPercentage > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Discount percentage must be between 0 and 100'
      });
    }

    // Validate semester format
    const validSemesters = ['Semester 1', 'Semester 2'];
    if (!validSemesters.includes(semester)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid semester. Must be "Semester 1" or "Semester 2"'
      });
    }

    // Validate academic year
    const currentYear = new Date().getFullYear();
    const yearPattern = /^\d{4}$/;
    if (!yearPattern.test(academicYear) || 
        parseInt(academicYear) < 2020 || 
        parseInt(academicYear) > currentYear + 5) {
      return res.status(400).json({
        success: false,
        message: `Invalid academic year. Must be between 2020 and ${currentYear + 5}`
      });
    }

    // Validate due date
    if (dueDate && !validateFutureDate(dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Due date cannot be in the past'
      });
    }

    // Validate room type
    if (roomType) {
      const validRoomTypes = ['Single', 'Double', 'Triple', 'Suite'];
      if (!validRoomTypes.includes(roomType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid room type. Must be Single, Double, Triple, or Suite'
        });
      }
    }

    // ========== BUSINESS LOGIC ==========

    // Calculate items array
    const items = [];
    if (roomFee > 0) items.push({ description: 'Room Fee', amount: roomFee });
    if (securityDeposit > 0) items.push({ description: 'Security Deposit', amount: securityDeposit });
    if (utilities > 0) items.push({ description: 'Utilities', amount: utilities });
    if (otherFees > 0) items.push({ description: 'Other Fees', amount: otherFees });

    // Ensure at least one fee item
    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one fee type must have a value greater than 0'
      });
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

    // Check for applicable discounts
    const applicableDiscounts = await Discount.find({
      studentId,
      status: 'Active',
      validFrom: { $lte: new Date() },
      $or: [
        { validTo: { $gte: new Date() } },
        { validTo: null }
      ]
    });

    let discountsApplied = [];
    let totalDiscountAmount = 0;

    for (const discount of applicableDiscounts) {
      if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
        continue; // Skip if usage limit reached
      }

      const discountAmount = discount.percentage 
        ? (subtotal * discount.percentage / 100)
        : discount.fixedAmount;

      discountsApplied.push({
        discountId: discount._id,
        code: discount.discountCode,
        amount: discountAmount
      });

      totalDiscountAmount += discountAmount;

      // Update usage count
      discount.usageCount += 1;
      await discount.save();
    }

    // Create invoice data
    const invoiceData = {
      studentName: sanitizedStudentName,
      studentId,
      semester: sanitizeInput(semester),
      academicYear: sanitizeInput(academicYear),
      items,
      subtotal,
      discountPercentage: discountPercentage || 0,
      roomType,
      roomNumber: roomNumber ? sanitizeInput(roomNumber) : undefined,
      discountsApplied,
      autoGenerated: req.body.autoGenerated || false,
      generatedBy: req.user ? req.user.id : 'system'
    };

    if (dueDate) {
      invoiceData.dueDate = new Date(dueDate);
    }

    // Create invoice
    const invoice = await Invoice.create(invoiceData);

    // Create notification for student
    await Notification.create({
      userId: studentId,
      type: 'invoice_generated',
      title: 'New Invoice Generated',
      message: `A new invoice ${invoice.invoiceNumber} has been created for ${semester}, ${academicYear}`,
      link: `/invoices`,
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An invoice with this number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID format'
      });
    }

    // Find invoice
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Prevent updates to paid invoices
    if (invoice.status === 'Paid' && !req.user?.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify paid invoices'
      });
    }

    // Validate update fields
    const allowedUpdates = ['dueDate', 'status', 'adminNotes'];
    const requestedUpdates = Object.keys(updates);
    const isValidOperation = requestedUpdates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates',
        allowedFields: allowedUpdates
      });
    }

    // Apply updates
    requestedUpdates.forEach(update => invoice[update] = updates[update]);
    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });

  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message
    });
  }
};

// Delete invoice (soft delete - mark as cancelled)
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID format'
      });
    }

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Cannot delete if payments have been made
    if (invoice.amountPaid > 0) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete invoice with payments. Contact administrator.'
      });
    }

    // Soft delete - mark as cancelled
    invoice.status = 'Cancelled';
    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Invoice cancelled successfully'
    });

  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
};