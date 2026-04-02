import { Navigate, useLocation } from 'react-router-dom';

function AdminRoute({ children }) {
  const location = useLocation();
  const isAdminAuthenticated = sessionStorage.getItem('uninest_admin_auth') === 'true';

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default AdminRoute;
