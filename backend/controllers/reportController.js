const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

// Get financial summary data
const getFinancialSummary = async (req, res) => {
    try {
        const totalInvoicedData = await Invoice.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        const totalPaidData = await Payment.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalInvoiced = totalInvoicedData[0]?.total || 0;
        const totalPaid = totalPaidData[0]?.total || 0;
        const totalOutstanding = totalInvoiced - totalPaid;

        res.status(200).json({
            success: true,
            data: {
                totalInvoiced,
                totalPaid,
                totalOutstanding,
                collectionRate: totalInvoiced > 0 ? (totalPaid / totalInvoiced * 100).toFixed(2) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Placeholder for analytics
const getPaymentAnalytics = async (req, res) => {
    try {
        const analytics = await Payment.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.status(200).json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Placeholder for exports
const exportPayments = async (req, res) => {
    res.status(501).json({ success: false, message: "Export functionality not yet implemented" });
};

const exportInvoices = async (req, res) => {
    res.status(501).json({ success: false, message: "Export functionality not yet implemented" });
};

module.exports = {
    getFinancialSummary,
    getPaymentAnalytics,
    exportPayments,
    exportInvoices
};
