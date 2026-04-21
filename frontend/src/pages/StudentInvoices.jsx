import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Download, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { getInvoices, getStudentInvoices } from '../services/paymentService';

function StudentInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get student ID from localStorage
      const studentData = localStorage.getItem('student');
      const studentId = studentData ? JSON.parse(studentData)._id : null;
      
      let response;
      if (studentId) {
        // Fetch this student's invoices
        response = await getStudentInvoices(studentId);
      } else {
        // Fallback: fetch all invoices (filtered by backend auth)
        response = await getInvoices();
      }
      
      if (response.success && Array.isArray(response.data)) {
        setInvoices(response.data);
      } else if (response.data) {
        setInvoices(Array.isArray(response.data) ? response.data : []);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices. Please try again later.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Partially Paid':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const handlePayNow = (invoice) => {
    if (invoice.outstandingBalance <= 0) {
      alert('This invoice is already paid');
      return;
    }
    navigate(`/payment-form/${invoice._id}`);
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Invoices</h1>
          <p className="text-gray-600 mt-2">View and manage your hostel fee invoices</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={fetchInvoices}
                className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {invoices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Amount Due</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.outstandingBalance || 0), 0))}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-indigo-100" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Paid Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {invoices.filter(inv => inv.status === 'Paid').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {invoices.filter(inv => inv.status !== 'Paid').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoices List */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Invoices Yet</h3>
            <p className="text-gray-600">You don't have any invoices at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left - Invoice Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{invoice.invoiceNumber}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {invoice.semester} • {invoice.academicYear}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Amount</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(invoice.totalAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount Paid</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(invoice.amountPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Outstanding</p>
                          <p className={`font-semibold ${invoice.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(invoice.outstandingBalance)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Due Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(invoice.dueDate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right - Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleViewDetails(invoice)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {invoice.outstandingBalance > 0 && invoice.status !== 'Paid' && (
                        <button
                          onClick={() => handlePayNow(invoice)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Pay Now</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoice Details Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">Invoice Details</h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-white hover:bg-indigo-700 p-1 rounded"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Invoice Header */}
                <div className="border-b pb-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 text-sm">Invoice Number</p>
                      <p className="text-lg font-bold text-gray-900">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border mt-1 ${getStatusColor(
                          selectedInvoice.status
                        )}`}
                      >
                        {selectedInvoice.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Invoice Date</p>
                      <p className="text-gray-900 font-medium">{formatDate(selectedInvoice.invoiceDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Due Date</p>
                      <p className="text-gray-900 font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Student Info */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Student Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 text-sm">Name</p>
                      <p className="text-gray-900 font-medium">{selectedInvoice.studentName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Student ID</p>
                      <p className="text-gray-900 font-medium">{selectedInvoice.studentId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Semester</p>
                      <p className="text-gray-900 font-medium">{selectedInvoice.semester}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Academic Year</p>
                      <p className="text-gray-900 font-medium">{selectedInvoice.academicYear}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="border-b pb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Fee Details</h3>
                  <div className="space-y-2">
                    {selectedInvoice.items && selectedInvoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span>{item.description}</span>
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Discount</span>
                      <span className="font-medium">-{formatCurrency(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                  {selectedInvoice.amountPaid > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Amount Paid</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.amountPaid)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-indigo-600">
                    <span>Outstanding Balance</span>
                    <span>{formatCurrency(selectedInvoice.outstandingBalance)}</span>
                  </div>
                </div>

                {/* Actions */}
                {selectedInvoice.outstandingBalance > 0 && selectedInvoice.status !== 'Paid' && (
                  <button
                    onClick={() => {
                      setSelectedInvoice(null);
                      handlePayNow(selectedInvoice);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Pay Now - {formatCurrency(selectedInvoice.outstandingBalance)}
                  </button>
                )}

                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentInvoices;