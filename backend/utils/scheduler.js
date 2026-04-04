const cron = require('node-cron');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const { sendPaymentReminder, sendOverdueWarning } = require('./emailService');

// Run daily at 9 AM
const checkPaymentReminders = cron.schedule('0 9 * * *', async () => {
  console.log('Running payment reminder check...');
  
  try {
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Find invoices due in 3 days
    const upcomingInvoices = await Invoice.find({
      status: { $in: ['Unpaid', 'Partially Paid'] },
      dueDate: {
        $gte: today,
        $lte: threeDaysFromNow
      },
      'notifications.type': { $ne: 'reminder' } // Not already sent
    });
    
    for (const invoice of upcomingInvoices) {
      // Send email reminder
      await sendPaymentReminder(`${invoice.studentId}@student.sliit.lk`, invoice);
      
      // Create notification
      await Notification.create({
        userId: invoice.studentId,
        type: 'payment_reminder',
        title: 'Payment Reminder',
        message: `Your payment for invoice ${invoice.invoiceNumber} is due in 3 days.`,
        link: `/invoices`,
        priority: 'medium'
      });
      
      // Update invoice
      invoice.notifications.push({
        type: 'reminder',
        sentDate: new Date(),
        sentTo: `${invoice.studentId}@student.sliit.lk`
      });
      await invoice.save();
    }
    
    console.log(`Sent ${upcomingInvoices.length} payment reminders`);
  } catch (error) {
    console.error('Error in payment reminder check:', error);
  }
});

// Run daily at 10 AM
const checkOverduePayments = cron.schedule('0 10 * * *', async () => {
  console.log('Running overdue payment check...');
  
  try {
    const today = new Date();
    
    // Find overdue invoices
    const overdueInvoices = await Invoice.find({
      status: { $in: ['Unpaid', 'Partially Paid'] },
      dueDate: { $lt: today }
    });
    
    for (const invoice of overdueInvoices) {
      // Update status
      invoice.status = 'Overdue';
      
      // Calculate late fees
      invoice.calculateLateFees();
      
      await invoice.save();
      
      // Send overdue warning
      await sendOverdueWarning(`${invoice.studentId}@student.sliit.lk`, invoice);
      
      // Create notification
      await Notification.create({
        userId: invoice.studentId,
        type: 'overdue_warning',
        title: 'Payment Overdue',
        message: `Your payment for invoice ${invoice.invoiceNumber} is now overdue!`,
        link: `/invoices`,
        priority: 'high'
      });
    }
    
    console.log(`Processed ${overdueInvoices.length} overdue invoices`);
  } catch (error) {
    console.error('Error in overdue payment check:', error);
  }
});

// Start all scheduled tasks
const startScheduler = () => {
  checkPaymentReminders.start();
  checkOverduePayments.start();
  console.log('✅ Scheduler started - Payment reminders and overdue checks active');
};

module.exports = {
  startScheduler
};