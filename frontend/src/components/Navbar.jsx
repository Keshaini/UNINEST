 import { useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-700' : '';
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">UniNest</h1>
              <p className="text-xs text-indigo-200">Hostel Management System</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => alert('Component 1: Student Registration\n(To be implemented by Team Member 1)')}
              className="px-4 py-2 rounded-lg font-medium transition-colors hover:bg-indigo-700 text-sm opacity-60 cursor-not-allowed"
              title="Component 1 - Other team member"
            >
              👤 Students
            </button>

            <button
              onClick={() => navigate('/hostels')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors hover:bg-indigo-700 text-sm ${isActive('/hostels')}`}
              title="Accommodation / Rooms"
            >
              🏢 Rooms
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/invoices')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors hover:bg-indigo-700 text-sm ${isActive('/invoices') || isActive('/')}`}
              >
                💳 Invoices
              </button>
              <button
                onClick={() => navigate('/payment-history')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors hover:bg-indigo-700 text-sm ${isActive('/payment-history')}`}
              >
                📊 Payments
              </button>
            </div>

            <button
              onClick={() => alert('Component 4: Complaint & Maintenance\n(To be implemented by Team Member 4)')}
              className="px-4 py-2 rounded-lg font-medium transition-colors hover:bg-indigo-700 text-sm opacity-60 cursor-not-allowed"
              title="Component 4 - Other team member"
            >
              🔧 Complaints
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => navigate('/invoices')}
              className={`px-3 py-2 rounded-lg font-medium text-sm ${isActive('/invoices') || isActive('/')}`}
            >
              💳
            </button>
            <button
              onClick={() => navigate('/payment-history')}
              className={`px-3 py-2 rounded-lg font-medium text-sm ${isActive('/payment-history')}`}
            >
              📊
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">Student Portal</div>
            </div>
            <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 
