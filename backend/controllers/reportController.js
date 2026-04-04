const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const { exportPaymentsToExcel, exportInvoicesToExcel } = require('../utils/excelExport');

// Get financial summary
const getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Invoice statistics
    const invoiceStats = await Invoice.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalBilled: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' },
          totalOutstanding: { $sum: '$outstandingBalance' },
          totalLateFees: { $sum: '$lateFees' }
        }
      }
    ]);

    // Payment statistics
    const paymentStats = await Payment.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: { paymentDate: dateFilter } }] : []),
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Status breakdown
    const statusBreakdown = await Invoice.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Refund statistics
    const refundStats = await Refund.aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: { requestDate: dateFilter } }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          totalPayments: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: invoiceStats[0] || {
          totalInvoices: 0,
          totalBilled: 0,
          totalPaid: 0,
          totalOutstanding: 0,
          totalLateFees: 0
        },
        paymentMethods: paymentStats,
        statusBreakdown,
        refunds: refundStats,
        monthlyTrend
      }
    });

  } catch (error) {
    console.error('Error generating financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate financial summary',
      error: error.message
    });
  }
};

// Export payments to Excel
const exportPayments = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const filter = {};
    
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter).sort({ paymentDate: -1 });

    const workbook = await exportPaymentsToExcel(payments);

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=payments-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export payments',
      error: error.message
    });
  }
};

// Export invoices to Excel
const exportInvoices = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const filter = {};
    
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    if (status) {
      filter.status = status;
    }

    const invoices = await Invoice.find(filter).sort({ invoiceDate: -1 });

    const workbook = await exportInvoicesToExcel(invoices);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoices-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export invoices',
      error: error.message
    });
  }
};

// Get payment analytics
const getPaymentAnalytics = async (req, res) => {
  try {
    // Average payment time (days from invoice to payment)
    const paymentTiming = await Payment.aggregate([
      {
        $lookup: {
          from: 'invoices',
          localField: 'invoiceId',
          foreignField: '_id',
          as: 'invoice'
        }
      },
      {
        $unwind: '$invoice'
      },
      {
        $project: {
          daysToPay: {
            $divide: [
              { $subtract: ['$paymentDate', '$invoice.invoiceDate'] },
              1000 * 60 * 60 * 24
            ]
          },
          amount: 1
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$daysToPay' },
          minDays: { $min: '$daysToPay' },
          maxDays: { $max: '$daysToPay' }
        }
      }
    ]);

    // Top paying students
    const topStudents = await Payment.aggregate([
      {
        $group: {
          _id: '$studentName',
          totalPaid: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalPaid: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Payment success rate
    const paymentSuccessRate = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        paymentTiming: paymentTiming[0] || { avgDays: 0, minDays: 0, maxDays: 0 },
        topStudents,
        successRate: paymentSuccessRate
      }
    });

  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics',
      error: error.message
    });
  }
};

module.exports = {
  getFinancialSummary,
  exportPayments,
  exportInvoices,
  getPaymentAnalytics
};