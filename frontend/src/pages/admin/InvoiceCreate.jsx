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
    roomFee: 0.00,
    securityDeposit: 0.00,
    utilities: 0.00,
    otherFees: 0.00,
    amountPaid: 0.00,
    discountPercentage: 0,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Format currency
  const formatCurrency = (amount) =>
    `LKR ${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Calculations
  const subtotal =
    Number(formData.roomFee) +
    Number(formData.securityDeposit) +
    Number(formData.utilities) +
    Number(formData.otherFees);

  const discount = (subtotal * Number(formData.discountPercentage)) / 100;
  const totalAmount = subtotal - discount;
  const outstandingBalance = totalAmount - Number(formData.amountPaid);

 // Validation function
const validateField = (name, value) => {
  let message = '';

  if (name === 'studentName' && !value?.toString().trim()) {
    message = 'Student name is required';
  }

  if (name === 'studentId' && !value?.toString().trim()) {
    message = 'Student ID is required';
  }

  if (name === 'semester' && !value?.toString().trim()) {
    message = 'Semester is required';
  }

  if (name === 'academicYear' && !value?.toString().trim()) {
    message = 'Academic year is required';
  }

  if (name === 'dueDate' && !value) {
    message = 'Due date is required';
  }

  // Amount validations
  if (
    ['roomFee', 'securityDeposit', 'utilities', 'otherFees', 'amountPaid'].includes(name)
  ) {
    if (value === '' || value === null || value === undefined) return '';
    if (Number(value) < 0) {
      message = 'Value cannot be negative';
    }
  }

  if (name === 'discountPercentage') {
    if (value === '' || value === null || value === undefined) return '';
    if (value < 0 || value > 100) {
      message = 'Must be between 0 - 100';
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

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Handle change (REAL-TIME validation)
const handleChange = (e) => {
  const { name, value } = e.target;

  const isAmountField =
    name.includes('Fee') ||
    name === 'utilities' ||
    name === 'amountPaid' ||
    name === 'discountPercentage';

  let newValue;

  if (isAmountField) {
    // Allow empty input (so user can type properly)
    newValue = value === '' ? '' : Number(value);
  } else {
    newValue = value;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: newValue,
  }));

  // Real-time validation
  const errorMsg = validateField(name, newValue);

  setErrors((prev) => ({
    ...prev,
    [name]: errorMsg,
  }));
};
  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    const invoiceData = {
      ...formData,
      items: [
        { description: 'Room Fee', amount: formData.roomFee },
        { description: 'Security Deposit', amount: formData.securityDeposit },
        { description: 'Utilities', amount: formData.utilities },
        { description: 'Other Fees', amount: formData.otherFees },
      ],
      subtotal,
      discount,
      totalAmount,
      outstandingBalance,
    };

    try {
      await createInvoice(invoiceData);
      navigate('/invoice');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  // Sample data
  const fillSampleData = () => {
    setFormData({
      studentName: 'Kamal Perera',
      studentId: 'IT20231234',
      semester: 'Semester 1',
      academicYear: '2025',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-04-15',
      roomFee: 50000,
      securityDeposit: 20000,
      utilities: 5000,
      otherFees: 3000,
      amountPaid: 10000,
      discountPercentage: 10,
    });
    setErrors({});
  };

  // Input style helper
  const inputStyle = (field) =>
    `mt-1 block w-full border rounded-md p-2 ${
      errors[field] ? 'border-red-500 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-6">Create Invoice</h2>

      {/* Sample Button */}
      <button
        type="button"
        onClick={fillSampleData}
        className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
      >
        Fill Sample Data
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Student Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label>Student Name *</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              className={inputStyle('studentName')}
            />
            {errors.studentName && <p className="text-red-500 text-sm">{errors.studentName}</p>}
          </div>

          <div>
            <label>Student ID *</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className={inputStyle('studentId')}
            />
            {errors.studentId && <p className="text-red-500 text-sm">{errors.studentId}</p>}
          </div>
        </div>

        {/* Semester */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Semester *</label>
            <input
              type="text"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className={inputStyle('semester')}
            />
            {errors.semester && <p className="text-red-500 text-sm">{errors.semester}</p>}
          </div>

          <div>
            <label>Academic Year *</label>
            <input
              type="text"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              className={inputStyle('academicYear')}
            />
            {errors.academicYear && <p className="text-red-500 text-sm">{errors.academicYear}</p>}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Invoice Date</label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label>Due Date *</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={inputStyle('dueDate')}
            />
            {errors.dueDate && <p className="text-red-500 text-sm">{errors.dueDate}</p>}
          </div>
        </div>

        {/* Fees */}
        {['roomFee', 'securityDeposit', 'utilities', 'otherFees', 'amountPaid', 'discountPercentage'].map((field) => (
          <div key={field}>
            <label className="capitalize">{field}</label>
            <input
              type="number"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className={inputStyle(field)}
              min={0}
            />
            {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
          </div>
        ))}

        {/* Totals */}
        <div className="space-y-2 mt-4 border-t pt-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>{formatCurrency(discount)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-red-600 font-semibold">
            <span>Outstanding:</span>
            <span>{formatCurrency(outstandingBalance)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
        >
          {submitting ? 'Creating...' : 'Create Invoice'}
        </button>
      </form>
    </div>
  );
}

export default InvoiceCreate;