import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import HostelManagementSystem from './pages/HostelManagementSystem';
import HostelBookingPage from './pages/HostelBookingPage';
import AdminHostelManagementSystem from './pages/AdminHostelManagementSystem';
import RoomChangeRequestPage from './pages/RoomChangeRequestPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/hostels" replace />} />
        <Route path="/hostels" element={<HostelManagementSystem />} />
        <Route path="/booking/:hostelId" element={<HostelBookingPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/hostels"
          element={
            <AdminRoute>
              <AdminHostelManagementSystem />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/room-change-requests"
          element={
            <AdminRoute>
              <RoomChangeRequestPage />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
