import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fromPath = location.state?.from || '/admin/hostels';

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'admin' && password === 'admin123') {
      sessionStorage.setItem('uninest_admin_auth', 'true');
      navigate(fromPath, { replace: true });
      return;
    }

    setError('Invalid admin credentials.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
        <p className="text-sm text-slate-500 mt-1">Access is restricted to authorized admins.</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-slate-600">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-600">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </label>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 font-semibold"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
