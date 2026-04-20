import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../../services/paymentService';

function InvoiceCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    semester: '',
    academicYear: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    roomFee: '',
    securityDeposit: '',
    utilities: '',
    otherFees: '',
    discountPercentage: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount || 0);

  const num = (val) => Number(val) || 0;

  const subtotal =
    num(formData.roomFee) +
    num(formData.securityDeposit) +
    num(formData.utilities) +
    num(formData.otherFees);

  const discount = (subtotal * num(formData.discountPercentage)) / 100;
  const totalAmount = subtotal - discount;

  const amountPaid = 0;
  const outstandingBalance = totalAmount;
  const status = 'Unpaid';

  const validateField = (name, value) => {
    let message = '';

    if (['studentName', 'studentId', 'semester', 'academicYear'].includes(name)) {
      if (!value?.toString().trim()) message = 'This field is required';
    }

    if (name === 'dueDate') {
      if (!value) message = 'Due date is required';
      else if (new Date(value) < new Date(formData.invoiceDate)) {
        message = 'Due date cannot be before invoice date';
      }
    }

    if (['roomFee', 'securityDeposit', 'utilities', 'otherFees'].includes(name)) {
      if (value !== '' && Number(value) < 0) {
        message = 'Cannot be negative';
      }
    }

    if (name === 'discountPercentage') {
      if (value !== '' && (value < 0 || value > 100)) {
        message = 'Must be 0 - 100';
      }
    }

    return message;
  };

  const validateForm = () => {
    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (subtotal === 0) {
      newErrors.general = 'At least one fee must be added';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const errorMsg = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    const invoiceData = {
      ...formData,
      subtotal,
      discount,
      totalAmount,
      amountPaid,
      outstandingBalance,
      status,
      items: [
        { description: 'Room Fee', amount: num(formData.roomFee) },
        { description: 'Security Deposit', amount: num(formData.securityDeposit) },
        { description: 'Utilities', amount: num(formData.utilities) },
        { description: 'Other Fees', amount: num(formData.otherFees) },
      ],
    };

    try {
      await createInvoice(invoiceData);
      navigate('/admin/invoices');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const inputStyle = (field) =>
    `mt-1 block w-full rounded-md p-2 bg-gray-900 text-gray-200 border ${
      errors[field] ? 'border-red-500' : 'border-gray-700'
    } focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 text-gray-200">
      <div className="max-w-3xl w-full bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white">Create Invoice</h2>

        {errors.general && (
          <p className="text-red-400 mb-4">{errors.general}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Student Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Student Name *</label>
              <input name="studentName" value={formData.studentName} onChange={handleChange} className={inputStyle('studentName')} />
              {errors.studentName && <p className="text-red-400 text-sm">{errors.studentName}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-400">Student ID *</label>
              <input name="studentId" value={formData.studentId} onChange={handleChange} className={inputStyle('studentId')} />
              {errors.studentId && <p className="text-red-400 text-sm">{errors.studentId}</p>}
            </div>
          </div>

          {/* Semester */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Semester *</label>
              <input name="semester" value={formData.semester} onChange={handleChange} className={inputStyle('semester')} />
              {errors.semester && <p className="text-red-400 text-sm">{errors.semester}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-400">Academic Year *</label>
              <input name="academicYear" value={formData.academicYear} onChange={handleChange} className={inputStyle('academicYear')} />
              {errors.academicYear && <p className="text-red-400 text-sm">{errors.academicYear}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Invoice Date</label>
              <input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleChange} className={inputStyle()} />
            </div>

            <div>
              <label className="text-sm text-gray-400">Due Date *</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputStyle('dueDate')} />
              {errors.dueDate && <p className="text-red-400 text-sm">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Fees */}
          {['roomFee', 'securityDeposit', 'utilities', 'otherFees', 'discountPercentage'].map((field) => (
            <div key={field}>
              <label className="capitalize text-sm text-gray-400">{field}</label>
              <input type="number" name={field} value={formData[field]} onChange={handleChange} className={inputStyle(field)} min={0} />
              {errors[field] && <p className="text-red-400 text-sm">{errors[field]}</p>}
            </div>
          ))}

          {/* Totals */}
          <div className="space-y-2 mt-4 border-t border-gray-700 pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>Discount:</span><span>{formatCurrency(discount)}</span></div>
            <div className="flex justify-between font-bold text-white"><span>Total:</span><span>{formatCurrency(totalAmount)}</span></div>
            <div className="flex justify-between text-red-400 font-semibold">
              <span>Outstanding:</span>
              <span>{formatCurrency(outstandingBalance)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Status:</span>
              <span className="font-medium">{status}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg mt-4"
          >
            {submitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InvoiceCreate;