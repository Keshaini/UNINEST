import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('role');

  // ✅ If NO token → allow access (for testing)
  if (!token) {
    return children;
  }

  // ✅ If role is specified but doesn't match → redirect
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;