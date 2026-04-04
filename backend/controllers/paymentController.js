const Payment = require('../models/Payment');

exports.recordPayment = async (req, res) => {
    try {
        const { studentId, amount, feeType, paymentMonth, status, paymentMethod, transactionId } = req.body;

        const payment = new Payment({
            studentId: studentId || (req.user.role === 'Student' ? req.user.profileId : null),
            amount,
            feeType,
            paymentMonth,
            status,
            paymentMethod,
            transactionId,
            paidAt: status === 'Paid' ? Date.now() : null
        });

        await payment.save();
        res.status(201).json(payment);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'Student') {
            filter.studentId = req.user.profileId;
        }
        const payments = await Payment.find(filter).populate('studentId', 'firstName lastName registrationNumber');
        res.json(payments);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ msg: 'Only admins can update status' });

        const { status, paymentMethod, transactionId } = req.body;
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ msg: 'Payment not found' });

        payment.status = status;
        if (paymentMethod) payment.paymentMethod = paymentMethod;
        if (transactionId) payment.transactionId = transactionId;
        if (status === 'Paid') payment.paidAt = Date.now();

        await payment.save();
        res.json(payment);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
};
