import { useState, useEffect } from 'react';
import { Plus, Tag, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getDiscounts, createDiscount, updateDiscountStatus } from '../../services/paymentService';

function DiscountManagement() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    type: 'scholarship',
    percentage: '',
    fixedAmount: '',
    description: '',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: '',
    usageLimit: '',
    applicableCategories: []
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await getDiscounts();
      if (response.success) {
        setDiscounts(response.data);
      }
    } catch (err) {
      setError('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(category)
        ? prev.applicableCategories.filter(c => c !== category)
        : [...prev.applicableCategories, category]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const discountData = {
        ...formData,
        percentage: formData.percentage ? parseFloat(formData.percentage) : 0,
        fixedAmount: formData.fixedAmount ? parseFloat(formData.fixedAmount) : 0,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
      };

      const response = await createDiscount(discountData);
      
      if (response.success) {
        setSuccess('Discount created successfully!');
        setShowCreateModal(false);
        setFormData({
          studentId: '',
          type: 'scholarship',
          percentage: '',
          fixedAmount: '',
          description: '',
          validFrom: new Date().toISOString().split('T')[0],
          validTo: '',
          usageLimit: '',
          applicableCategories: []
        });
        fetchDiscounts();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create discount');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await updateDiscountStatus(id, status);
      if (response.success) {
        setSuccess(`Discount ${status.toLowerCase()} successfully!`);
        fetchDiscounts();
      }
    } catch (err) {
      setError('Failed to update discount status');
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      'scholarship': 'bg-purple-100 text-purple-800',
      'early_payment': 'bg-blue-100 text-blue-800',
      'sibling': 'bg-green-100 text-green-800',
      'merit': 'bg-yellow-100 text-yellow-800',
      'custom': 'bg-gray-100 text-gray-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Active': 'bg-green-100 text-green-800',
      'Expired': 'bg-red-100 text-red-800',
      'Disabled': 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading discounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
              <p className="text-gray-600 mt-2">Create and manage student discounts</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Discount
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Discounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <div key={discount._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-gray-900">{discount.discountCode}</h3>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getTypeBadge(discount.type)}`}>
                    {discount.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(discount.status)}`}>
                  {discount.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Student ID</p>
                  <p className="font-semibold text-gray-900">{discount.studentId}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Discount Value</p>
                  <p className="font-semibold text-gray-900">
                    {discount.percentage > 0 
                      ? `${discount.percentage}% off`
                      : `LKR ${discount.fixedAmount.toLocaleString()} off`
                    }
                  </p>
                </div>

                {discount.description && (
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-sm text-gray-900">{discount.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-600">Valid From</p>
                    <p className="text-gray-900">{new Date(discount.validFrom).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valid To</p>
                    <p className="text-gray-900">
                      {discount.validTo ? new Date(discount.validTo).toLocaleDateString('en-GB') : 'No expiry'}
                    </p>
                  </div>
                </div>

                {discount.usageLimit && (
                  <div className="text-xs">
                    <p className="text-gray-600">Usage</p>
                    <p className="text-gray-900">{discount.usageCount} / {discount.usageLimit} times</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {discount.status === 'Active' && (
                  <button
                    onClick={() => handleStatusChange(discount._id, 'Disabled')}
                    className="flex-1 px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Disable
                  </button>
                )}
                {discount.status === 'Disabled' && (
                  <button
                    onClick={() => handleStatusChange(discount._id, 'Active')}
                    className="flex-1 px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {discounts.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Discounts Yet</h3>
            <p className="text-gray-600 mb-6">Create your first discount to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Discount
            </button>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Discount</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Student ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="IT23123456"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="scholarship">Scholarship</option>
                    <option value="early_payment">Early Payment</option>
                    <option value="sibling">Sibling Discount</option>
                    <option value="merit">Merit Based</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Percentage or Fixed Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Percentage (%)
                    </label>
                    <input
                      type="number"
                      name="percentage"
                      value={formData.percentage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fixed Amount (LKR)
                    </label>
                    <input
                      type="number"
                      name="fixedAmount"
                      value={formData.fixedAmount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter discount description..."
                  />
                </div>

                {/* Valid Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid From
                    </label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid To (Optional)
                    </label>
                    <input
                      type="date"
                      name="validTo"
                      value={formData.validTo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>

                {/* Applicable Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applicable Categories
                  </label>
                  <div className="space-y-2">
                    {['Room Fee', 'Security Deposit', 'Utilities', 'Other Fees'].map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.applicableCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Create Discount
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscountManagement;