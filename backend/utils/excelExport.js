const ExcelJS = require('exceljs');

// Export payments to Excel
const exportPaymentsToExcel = async (payments) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Payments');

  // Define columns
  worksheet.columns = [
    { header: 'Receipt Number', key: 'receiptNumber', width: 20 },
    { header: 'Transaction ID', key: 'transactionId', width: 25 },
    { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
    { header: 'Student Name', key: 'studentName', width: 25 },
    { header: 'Student ID', key: 'studentId', width: 15 },
    { header: 'Amount (LKR)', key: 'amount', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 15 },
    { header: 'Payment Date', key: 'paymentDate', width: 20 },
    { header: 'Status', key: 'status', width: 12 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Add data rows
  payments.forEach(payment => {
    worksheet.addRow({
      receiptNumber: payment.receiptNumber,
      transactionId: payment.transactionId,
      invoiceNumber: payment.invoiceNumber,
      studentName: payment.studentName,
      studentId: payment.studentId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentDate: new Date(payment.paymentDate).toLocaleDateString('en-GB'),
      status: payment.status
    });
  });

  // Add summary at the end
  const totalRow = worksheet.addRow({
    receiptNumber: '',
    transactionId: '',
    invoiceNumber: '',
    studentName: '',
    studentId: 'TOTAL:',
    amount: payments.reduce((sum, p) => sum + p.amount, 0),
    paymentMethod: '',
    paymentDate: '',
    status: ''
  });
  totalRow.font = { bold: true };

  return workbook;
};

// Export invoices to Excel
const exportInvoicesToExcel = async (invoices) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Invoices');

  worksheet.columns = [
    { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
    { header: 'Student Name', key: 'studentName', width: 25 },
    { header: 'Student ID', key: 'studentId', width: 15 },
    { header: 'Total Amount', key: 'totalAmount', width: 15 },
    { header: 'Amount Paid', key: 'amountPaid', width: 15 },
    { header: 'Outstanding', key: 'outstandingBalance', width: 15 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Status', key: 'status', width: 15 }
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Add data
  invoices.forEach(invoice => {
    const row = worksheet.addRow({
      invoiceNumber: invoice.invoiceNumber,
      studentName: invoice.studentName,
      studentId: invoice.studentId,
      totalAmount: invoice.totalAmount,
      amountPaid: invoice.amountPaid,
      outstandingBalance: invoice.outstandingBalance,
      dueDate: new Date(invoice.dueDate).toLocaleDateString('en-GB'),
      status: invoice.status
    });

    // Color code status
    const statusCell = row.getCell('status');
    if (invoice.status === 'Paid') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF16A34A' }
      };
      statusCell.font = { color: { argb: 'FFFFFFFF' } };
    } else if (invoice.status === 'Overdue') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC2626' }
      };
      statusCell.font = { color: { argb: 'FFFFFFFF' } };
    }
  });

  return workbook;
};

module.exports = {
  exportPaymentsToExcel,
  exportInvoicesToExcel
};