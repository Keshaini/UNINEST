import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './common/Navbar';  
import Footer from './common/Footer';

// Auth Components
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
import PaymentVerification from './pages/admin/PaymentVerification';
import DiscountManagement from './pages/admin/DiscountManagement';
import Reports from './pages/admin/Reports';

// Shared Pages
import NotificationCenter from './pages/shared/NotificationCenter';

function App() {
  return (
    <Router>
      <div className="App flex flex-col min-h-screen">
          {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" /> 

        {/* ✅ Navbar ALWAYS visible */}
        <Navbar />

        {/* ✅ Page Content */}
        <div className="flex-grow">
          <Routes>
            
              {/* Student Routes (Protected) */}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

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
                  <ProtectedRoute>
                    <InvoiceView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/invoice/:id" 
                element={
                  <ProtectedRoute>
                    <InvoiceView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment-form/:invoiceId" 
                element={
                  <ProtectedRoute>
                    <PaymentForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment-success" 
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment-history" 
                element={
                  <ProtectedRoute>
                    <PaymentHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bank-transfer/:invoiceId" 
                element={
                  <ProtectedRoute>
                    <BankTransfer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/refund-request/:paymentId" 
                element={
                  <ProtectedRoute>
                    <RefundRequest />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/refund-history" 
                element={
                  <ProtectedRoute>
                    <RefundHistory />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes (Protected + Admin Only) */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/invoice/create" 
                element={
                  <ProtectedRoute adminOnly>
                    <InvoiceCreate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/verifications" 
                element={
                  <ProtectedRoute adminOnly>
                    <PaymentVerification />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/discounts" 
                element={
                  <ProtectedRoute adminOnly>
                    <DiscountManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedRoute adminOnly>
                    <Reports />
                  </ProtectedRoute>
                } 
              />

              {/* Shared Routes */}
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationCenter />
                  </ProtectedRoute>
                } 
              />
          </Routes>
        </div>

        {/* ✅ Footer ALWAYS visible */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;