import { useState, useEffect } from 'react';
import { Plus, Tag, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
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
    } catch {
      setError('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    } catch {
      setError('Failed to update discount status');
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      scholarship: 'bg-purple-900 text-purple-300',
      early_payment: 'bg-blue-900 text-blue-300',
      sibling: 'bg-green-900 text-green-300',
      merit: 'bg-yellow-900 text-yellow-300',
      custom: 'bg-gray-800 text-gray-300'
    };
    return badges[type] || 'bg-gray-800 text-gray-300';
  };

  const getStatusBadge = (status) => {
    const badges = {
      Active: 'bg-green-900 text-green-300',
      Expired: 'bg-red-900 text-red-300',
      Disabled: 'bg-gray-800 text-gray-300'
    };
    return badges[status] || 'bg-gray-800 text-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center text-white">
        Loading discounts...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] py-8 px-4 text-slate-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Discount Management</h1>
            <p className="text-gray-400 mt-2">Create and manage student discounts</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Discount
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 p-4 mb-6 flex items-center">
            <AlertCircle className="mr-2" /> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/40 border border-green-700 p-4 mb-6 flex items-center">
            <CheckCircle className="mr-2" /> {success}
          </div>
        )}

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((d) => (
            <div key={d._id} className="bg-[#111827] border border-gray-800 rounded-xl p-6">

              <div className="flex justify-between mb-3">
                <h3 className="text-white font-bold">{d.discountCode}</h3>
                <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(d.status)}`}>
                  {d.status}
                </span>
              </div>

              <span className={`px-2 py-1 text-xs rounded ${getTypeBadge(d.type)}`}>
                {d.type}
              </span>

              <p className="mt-3 text-sm">Student: {d.studentId}</p>

              <p className="mt-2 font-semibold">
                {d.percentage > 0 ? `${d.percentage}% off` : `LKR ${d.fixedAmount}`}
              </p>

              <div className="mt-4 flex gap-2">
                {d.status === 'Active' && (
                  <button
                    onClick={() => handleStatusChange(d._id, 'Disabled')}
                    className="flex-1 border border-red-600 text-red-400 py-2 rounded hover:bg-red-900/30"
                  >
                    Disable
                  </button>
                )}
                {d.status === 'Disabled' && (
                  <button
                    onClick={() => handleStatusChange(d._id, 'Active')}
                    className="flex-1 border border-green-600 text-green-400 py-2 rounded hover:bg-green-900/30"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty */}
        {discounts.length === 0 && (
          <div className="text-center mt-10 text-gray-400">
            No discounts found
          </div>
        )}

        {/* MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
            <div className="bg-[#111827] p-6 rounded-xl w-full max-w-lg text-white">

              <h2 className="text-xl mb-4">Create Discount</h2>

              <form onSubmit={handleSubmit} className="space-y-3">

                <input name="studentId" placeholder="Student ID" onChange={handleInputChange}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded" />

                <input name="percentage" placeholder="Percentage" type="number"
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded" />

                <input name="fixedAmount" placeholder="Fixed Amount"
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded" />

                <textarea name="description" placeholder="Description"
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded" />

                <div className="flex gap-3">
                  <button type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 border border-gray-600 py-2 rounded">
                    Cancel
                  </button>

                  <button type="submit"
                    className="flex-1 bg-indigo-600 py-2 rounded">
                    Create
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