import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, FileText, CreditCard, BarChart3, Users, Building2, Wrench, ChevronDown } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingDropdownOpen, setBillingDropdownOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const isBillingActive = () => {
    return location.pathname.includes('/invoice') || 
           location.pathname.includes('/payment');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
              <span className="text-2xl">🏠</span>
            </div>
            <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                UniNest
              </span>
              <p className="text-xs text-slate-500 -mt-1">Hostel Management</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Dashboard/Home */}
            <button
              onClick={() => navigate('/')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/') && !isBillingActive()
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </button>

            {/* Component 1 - Students (Disabled) */}
            <div className="relative group">
              <button
                disabled
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-slate-400 cursor-not-allowed opacity-60"
                title="Component 1 - Student Registration (Other Team Member)"
              >
                <Users size={18} />
                <span>Students</span>
              </button>
              <div className="absolute hidden group-hover:block top-full left-0 mt-1 px-3 py-1 bg-gray-100 text-slate-700 text-xs rounded shadow-lg whitespace-nowrap border border-slate-200">
                Component 1 - Other Team Member
              </div>
            </div>

            {/* Component 2 - Accommodation (Disabled) */}
            <div className="relative group">
              <button
                disabled
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-slate-400 cursor-not-allowed opacity-60"
                title="Component 2 - Accommodation Management (Other Team Member)"
              >
                <Building2 size={18} />
                <span>Rooms</span>
              </button>
              <div className="absolute hidden group-hover:block top-full left-0 mt-1 px-3 py-1 bg-gray-100 text-slate-700 text-xs rounded shadow-lg whitespace-nowrap border border-slate-200">
                Component 2 - Other Team Member
              </div>
            </div>

            {/* Component 3 - Billing & Payments (YOUR COMPONENT - ACTIVE WITH DROPDOWN) */}
            <div className="relative">
              <button
                onClick={() => setBillingDropdownOpen(!billingDropdownOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isBillingActive()
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <CreditCard size={18} />
                <span>Billing</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${billingDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {billingDropdownOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setBillingDropdownOpen(false)}
                  />
                  
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Billing & Payments
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate('/invoice');
                        setBillingDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors duration-200 ${
                        isActive('/invoice')
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FileText size={20} />
                      <div className="text-left">
                        <div className="font-medium">My Invoices</div>
                        <div className="text-xs text-gray-500">View hostel fee invoices</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/payment-history');
                        setBillingDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors duration-200 ${
                        isActive('/payment-history')
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart3 size={20} />
                      <div className="text-left">
                        <div className="font-medium">Payment History</div>
                        <div className="text-xs text-gray-500">Track all payments</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Component 4 - Complaints (Disabled) */}
            <div className="relative group">
              <button
                disabled
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-slate-400 cursor-not-allowed opacity-60"
                title="Component 4 - Complaint & Maintenance (Other Team Member)"
              >
                <Wrench size={18} />
                <span>Complaints</span>
              </button>
              <div className="absolute hidden group-hover:block top-full left-0 mt-1 px-3 py-1 bg-gray-100 text-slate-700 text-xs rounded shadow-lg whitespace-nowrap border border-slate-200">
                Component 4 - Other Team Member
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Student Portal</p>
              <p className="text-xs text-gray-500">Sarah Johnson - IT23123456</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              SJ
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {/* Mobile - Dashboard */}
              <button
                onClick={() => {
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/') && !isBillingActive()
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home size={20} />
                <span className="font-medium">Dashboard</span>
              </button>

              {/* Mobile - Billing Section */}
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Billing & Payments
                </p>
              </div>

              <button
                onClick={() => {
                  navigate('/invoices');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/invoices')
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText size={20} />
                <span className="font-medium">My Invoices</span>
              </button>

              <button
                onClick={() => {
                  navigate('/payment-history');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/payment-history')
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 size={20} />
                <span className="font-medium">Payment History</span>
              </button>

              {/* Mobile - Disabled Components Info */}
              <div className="px-4 py-3 mt-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2 font-medium">Other Components:</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>• Students - Team Member 1</p>
                  <p>• Rooms - Team Member 2</p>
                  <p>• Complaints - Team Member 4</p>
                </div>
              </div>

              {/* Mobile - User Info */}
              <div className="px-4 py-3 mt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    SJ
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Sarah Johnson</p>
                    <p className="text-xs text-gray-500">IT23123456</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                      STUDENT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;