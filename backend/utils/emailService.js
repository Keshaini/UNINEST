const nodemailer = require('nodemailer');

// Create transporter (Gmail example)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send payment reminder
const sendPaymentReminder = async (email, invoice) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Payment Reminder - Invoice ${invoice.invoiceNumber}`,
    html: `
      <h2>Payment Reminder</h2>
      <p>Dear ${invoice.studentName},</p>
      <p>This is a reminder that your hostel fee payment is due.</p>
      <ul>
        <li>Invoice Number: ${invoice.invoiceNumber}</li>
        <li>Amount Due: LKR ${invoice.outstandingBalance.toLocaleString()}</li>
        <li>Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</li>
      </ul>
      <p>Please make your payment as soon as possible.</p>
      <p>Best regards,<br>UniNest Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Send payment confirmation
const sendPaymentConfirmation = async (email, payment, invoice) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Payment Confirmation - ${payment.receiptNumber}`,
    html: `
      <h2>Payment Successful!</h2>
      <p>Dear ${invoice.studentName},</p>
      <p>Your payment has been received successfully.</p>
      <ul>
        <li>Receipt Number: ${payment.receiptNumber}</li>
        <li>Amount Paid: LKR ${payment.amount.toLocaleString()}</li>
        <li>Payment Date: ${new Date(payment.paymentDate).toLocaleDateString()}</li>
        <li>Invoice Number: ${invoice.invoiceNumber}</li>
      </ul>
      <p>Thank you for your payment!</p>
      <p>Best regards,<br>UniNest Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Send overdue warning
const sendOverdueWarning = async (email, invoice) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `URGENT: Overdue Payment - Invoice ${invoice.invoiceNumber}`,
    html: `
      <h2 style="color: red;">Payment Overdue</h2>
      <p>Dear ${invoice.studentName},</p>
      <p><strong>Your payment is now overdue.</strong></p>
      <ul>
        <li>Invoice Number: ${invoice.invoiceNumber}</li>
        <li>Amount Due: LKR ${invoice.outstandingBalance.toLocaleString()}</li>
        <li>Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</li>
        <li>Late Fees: LKR ${invoice.lateFees || 0}</li>
      </ul>
      <p>Please make your payment immediately to avoid additional late fees.</p>
      <p>Best regards,<br>UniNest Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

module.exports = {
  sendPaymentReminder,
  sendPaymentConfirmation,
  sendOverdueWarning
};