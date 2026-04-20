import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './common/Navbar';  
import Footer from './common/Footer';

// Auth
import ProtectedRoute from './components/auth/ProtectedRoute';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import InvoiceView from './pages/student/InvoiceView';
import PaymentForm from './pages/student/PaymentForm';
import PaymentSuccess from './pages/student/PaymentSuccess';
import PaymentHistory from './pages/student/PaymentHistory';
import BankTransfer from './pages/student/BankTransfer';
import RefundRequest from './pages/student/RefundRequest';
import RefundHistory from './pages/student/RefundHistory';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import InvoiceCreate from './pages/admin/InvoiceCreate';
import InvoiceList from './pages/admin/InvoiceList'; // ✅ IMPORTANT
import PaymentVerification from './pages/admin/PaymentVerification';
import DiscountManagement from './pages/admin/DiscountManagement';
import Reports from './pages/admin/Reports';

// Shared
import NotificationCenter from './pages/shared/NotificationCenter';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">

        <ToastContainer position="top-right" autoClose={2000} theme="colored" />

        <Navbar />

        <div className="flex-grow">
          <Routes>

            {/* ✅ DEFAULT ROUTE (TEST MODE) */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

            {/* ================= STUDENT ================= */}

            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/invoice" 
              element={
                <ProtectedRoute role="student">
                  <InvoiceView />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/payment-form/:invoiceId" 
              element={
                <ProtectedRoute role="student">
                  <PaymentForm />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/payment-success" 
              element={
                <ProtectedRoute role="student">
                  <PaymentSuccess />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/payment-history" 
              element={
                <ProtectedRoute role="student">
                  <PaymentHistory />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/bank-transfer/:invoiceId" 
              element={
                <ProtectedRoute role="student">
                  <BankTransfer />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/refund-request/:paymentId" 
              element={
                <ProtectedRoute role="student">
                  <RefundRequest />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/refund-history" 
              element={
                <ProtectedRoute role="student">
                  <RefundHistory />
                </ProtectedRoute>
              } 
            />

            {/* ================= ADMIN ================= */}

            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/invoices" 
              element={
                <ProtectedRoute role="admin">
                  <InvoiceList />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/invoice/create" 
              element={
                <ProtectedRoute role="admin">
                  <InvoiceCreate />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/verifications" 
              element={
                <ProtectedRoute role="admin">
                  <PaymentVerification />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/discounts" 
              element={
                <ProtectedRoute role="admin">
                  <DiscountManagement />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute role="admin">
                  <Reports />
                </ProtectedRoute>
              } 
            />

            {/* ================= SHARED ================= */}

            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <NotificationCenter />
                </ProtectedRoute>
              } 
            />

            {/* ✅ FALLBACK */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;