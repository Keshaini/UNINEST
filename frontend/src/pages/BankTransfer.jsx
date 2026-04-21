import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { submitBankTransfer } from '../services/paymentService';

function BankTransfer() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    transactionReference: '',
    transferDate: '',
    studentName: ''
  });
  
  const [receiptFile, setReceiptFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG) or PDF file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setReceiptFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
      
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.amount || !formData.bankName || !formData.transactionReference || !formData.transferDate || !receiptFile) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      if (parseFloat(formData.amount) <= 0) {
        setError('Amount must be greater than 0');
        setLoading(false);
        return;
      }

      // Create FormData
      const submitData = new FormData();
      submitData.append('invoiceId', invoiceId);
      submitData.append('amount', formData.amount);
      submitData.append('bankName', formData.bankName);
      submitData.append('transactionReference', formData.transactionReference);
      submitData.append('transferDate', formData.transferDate);
      submitData.append('studentName', formData.studentName);
      submitData.append('receiptImage', receiptFile);

      const response = await submitBankTransfer(submitData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/payment-history');
        }, 3000);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit bank transfer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bank Transfer Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment is pending verification by our admin team. You will be notified once it's approved.
            </p>
            <button
              onClick={() => navigate('/payment-history')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Payment History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Bank Transfer Payment</h1>
          <p className="text-gray-600 mt-2">Upload your bank transfer receipt for verification</p>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Important Instructions:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Upload a clear photo/scan of your bank transfer receipt</li>
                <li>Accepted formats: JPEG, PNG, PDF (max 5MB)</li>
                <li>Payment will be verified within 24-48 hours</li>
                <li>You will receive a notification once verified</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (LKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter amount"
                min="1"
                step="0.01"
                required
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select bank</option>
                <option value="Bank of Ceylon">Bank of Ceylon</option>
                <option value="People's Bank">People's Bank</option>
                <option value="Commercial Bank">Commercial Bank</option>
                <option value="Sampath Bank">Sampath Bank</option>
                <option value="Hatton National Bank">Hatton National Bank</option>
                <option value="Nations Trust Bank">Nations Trust Bank</option>
                <option value="DFCC Bank">DFCC Bank</option>
                <option value="Seylan Bank">Seylan Bank</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Transaction Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Reference Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="transactionReference"
                value={formData.transactionReference}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter transaction reference"
                required
              />
            </div>

            {/* Transfer Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="transferDate"
                value={formData.transferDate}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Receipt <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  className="hidden"
                  id="receipt-upload"
                  required
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    JPEG, PNG or PDF (max 5MB)
                  </p>
                </label>
              </div>

              {/* Preview */}
              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="max-w-full h-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}

              {receiptFile && !preview && (
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  {receiptFile.name}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BankTransfer;