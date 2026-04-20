import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, Download } from 'lucide-react';
import { getInvoices } from '../../services/paymentService';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function InvoiceList() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await getInvoices();
      setInvoices(response.data || response.data?.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-900 text-green-300';
      case 'Partially Paid':
        return 'bg-yellow-900 text-yellow-300';
      case 'Unpaid':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // ================= PDF FUNCTIONS =================

  const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('University Invoice', 14, 20);

    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
    doc.text(`Student: ${invoice.studentName}`, 14, 38);
    doc.text(`Status: ${invoice.status}`, 14, 46);

    autoTable(doc, {
      startY: 55,
      head: [['Field', 'Amount']],
      body: [
        ['Total Amount', formatCurrency(invoice.totalAmount)],
        ['Amount Paid', formatCurrency(invoice.amountPaid)],
        ['Outstanding', formatCurrency(invoice.outstandingBalance)],
      ],
    });

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const exportAllInvoices = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('All Invoices Report', 14, 20);

    const tableData = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.studentName,
      formatCurrency(inv.totalAmount),
      formatCurrency(inv.amountPaid),
      formatCurrency(inv.outstandingBalance),
      inv.status,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Invoice #', 'Student', 'Total', 'Paid', 'Balance', 'Status']],
      body: tableData,
    });

    doc.save('All_Invoices_Report.pdf');
  };

  // ================= UI =================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <p className="text-gray-400">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] p-6 text-gray-200">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Invoices</h1>
            <p className="text-gray-400">Manage all student invoices</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportAllInvoices}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
            >
              <Download className="w-5 h-5" />
              Export All
            </button>

            <button
              onClick={() => navigate('/admin/invoice/create')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <PlusCircle className="w-5 h-5" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-900 text-gray-400 text-sm uppercase">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Student</th>
                <th className="p-4">Total</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-6 text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="border-t border-gray-700 hover:bg-gray-700">
                    <td className="p-4 font-medium">{inv.invoiceNumber}</td>
                    <td className="p-4">{inv.studentName}</td>
                    <td className="p-4">{formatCurrency(inv.totalAmount)}</td>
                    <td className="p-4">{formatCurrency(inv.amountPaid)}</td>
                    <td className="p-4">{formatCurrency(inv.outstandingBalance)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => generateInvoicePDF(inv)}
                        className="flex items-center gap-1 bg-indigo-700 text-white px-3 py-1 rounded hover:bg-indigo-800 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default InvoiceList;