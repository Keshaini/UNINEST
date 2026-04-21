import { Navigate, useLocation } from 'react-router-dom';

function AdminRoute({ children }) {
  const location = useLocation();
  const isAdminAuthenticated = localStorage.getItem('adminToken') !== null

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default AdminRoute;
