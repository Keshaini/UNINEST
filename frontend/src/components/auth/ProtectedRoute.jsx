import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('role');

  // ❌ No token → allow (for now testing)
  if (!token) return children;

  // ❌ Role mismatch
  if (role && userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;