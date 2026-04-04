const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate payment receipt PDF
const generateReceipt = async (payment, invoice) => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../uploads/receipts');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `receipt-${payment.receiptNumber}.pdf`;
      const filepath = path.join(uploadsDir, filename);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header with Logo
      doc.fontSize(28)
         .fillColor('#4F46E5')
         .text('UniNest', 50, 50);
      
      doc.fontSize(10)
         .fillColor('#666')
         .text('Hostel Management System', 50, 85);

      // Receipt Title
      doc.fontSize(20)
         .fillColor('#000')
         .text('PAYMENT RECEIPT', 50, 120);

      // Horizontal line
      doc.moveTo(50, 150)
         .lineTo(550, 150)
         .stroke();

      // Receipt Details
      let yPosition = 170;

      doc.fontSize(12)
         .fillColor('#000')
         .font('Helvetica-Bold')
         .text('Receipt Number:', 50, yPosition)
         .font('Helvetica')
         .text(payment.receiptNumber, 200, yPosition);

      yPosition += 20;
      doc.font('Helvetica-Bold')
         .text('Transaction ID:', 50, yPosition)
         .font('Helvetica')
         .text(payment.transactionId, 200, yPosition);

      yPosition += 20;
      doc.font('Helvetica-Bold')
         .text('Payment Date:', 50, yPosition)
         .font('Helvetica')
         .text(new Date(payment.paymentDate).toLocaleDateString('en-GB'), 200, yPosition);

      yPosition += 20;
      doc.font('Helvetica-Bold')
         .text('Payment Method:', 50, yPosition)
         .font('Helvetica')
         .text(payment.paymentMethod, 200, yPosition);

      // Student Information
      yPosition += 40;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Student Information', 50, yPosition);

      yPosition += 25;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Name:', 50, yPosition)
         .font('Helvetica')
         .text(invoice.studentName, 200, yPosition);

      yPosition += 20;
      doc.font('Helvetica-Bold')
         .text('Student ID:', 50, yPosition)
         .font('Helvetica')
         .text(invoice.studentId, 200, yPosition);

      yPosition += 20;
      doc.font('Helvetica-Bold')
         .text('Semester:', 50, yPosition)
         .font('Helvetica')
         .text(`${invoice.semester}, ${invoice.academicYear}`, 200, yPosition);

      // Invoice Details
      yPosition += 40;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Invoice Details', 50, yPosition);

      yPosition += 25;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Invoice Number:', 50, yPosition)
         .font('Helvetica')
         .text(invoice.invoiceNumber, 200, yPosition);

      // Payment Breakdown
      yPosition += 40;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Payment Breakdown', 50, yPosition);

      yPosition += 25;
      
      // Table header
      doc.fontSize(11)
         .font('Helvetica-Bold');
      doc.text('Description', 50, yPosition)
         .text('Amount (LKR)', 400, yPosition, { width: 100, align: 'right' });

      yPosition += 20;
      doc.moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .stroke();

      yPosition += 10;

      // Items
      doc.font('Helvetica');
      invoice.items.forEach(item => {
        doc.text(item.description, 50, yPosition)
           .text(item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), 400, yPosition, { width: 100, align: 'right' });
        yPosition += 20;
      });

      yPosition += 10;
      doc.moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .stroke();

      yPosition += 15;

      // Subtotal
      doc.font('Helvetica-Bold')
         .text('Subtotal:', 300, yPosition)
         .text(invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 }), 400, yPosition, { width: 100, align: 'right' });

      if (invoice.discount > 0) {
        yPosition += 20;
        doc.fillColor('#16A34A')
           .text(`Discount (${invoice.discountPercentage}%):`, 300, yPosition)
           .text(`-${invoice.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 400, yPosition, { width: 100, align: 'right' });
        doc.fillColor('#000');
      }

      yPosition += 20;
      doc.fontSize(12)
         .text('Total Amount:', 300, yPosition)
         .text(invoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }), 400, yPosition, { width: 100, align: 'right' });

      yPosition += 20;
      doc.fontSize(14)
         .fillColor('#16A34A')
         .text('Amount Paid:', 300, yPosition)
         .text(payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), 400, yPosition, { width: 100, align: 'right' });
      doc.fillColor('#000');

      yPosition += 20;
      doc.fontSize(12)
         .text('Outstanding Balance:', 300, yPosition)
         .text(invoice.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }), 400, yPosition, { width: 100, align: 'right' });

      // Status
      yPosition += 40;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(invoice.status === 'Paid' ? '#16A34A' : '#DC2626')
         .text(`Status: ${invoice.status}`, 50, yPosition);

      // Footer
      doc.fontSize(10)
         .fillColor('#666')
         .font('Helvetica')
         .text('Thank you for your payment!', 50, 700, { align: 'center', width: 500 });
      
      doc.fontSize(8)
         .text('This is a computer-generated receipt and does not require a signature.', 50, 720, { align: 'center', width: 500 });
      
      doc.text('UniNest Hostel Management System', 50, 735, { align: 'center', width: 500 });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/receipts/${filename}`);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateReceipt
};