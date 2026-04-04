import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './common/Navbar';  
import Footer from './common/Footer';

// Student
import InvoiceView from './components/payments/InvoiceView';
import PaymentForm from './components/payments/PaymentForm';
import PaymentSuccess from './components/payments/PaymentSuccess';
import PaymentHistory from './components/payments/PaymentHistory';
import InvoiceCreate from './pages/invoices/InvoiceCreate';
import BankTransfer from './components/payments/BankTransfer';
import RefundRequest from './components/payments/RefundRequest';
import RefundHistory from './components/payments/RefundHistory';

// Admin 
import PaymentVerification from './components/admin/PaymentVerification';
import DiscountManagement from './components/admin/DiscountManagement';
import Reports from './components/admin/Reports';

// Notifications
import NotificationCenter from './components/notifications/NotificationCenter';

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
            <Route path="/" element={<InvoiceCreate />} />
            <Route path="/invoice" element={<InvoiceView />} />
            <Route path="/payment-form/:invoiceId" element={<PaymentForm />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/invoice-create" element={<InvoiceCreate />} />
            <Route path="/bank-transfer" element={<BankTransfer />} />
            <Route path="/refund-request" element={<RefundRequest />} />
            <Route path="/refund-history" element={<RefundHistory />} /> 
            <Route path="/notifications" element={<NotificationCenter />} />

            {/* Admin Routes */}
            <Route path="/admin/verifications" element={<PaymentVerification />} />
            <Route path="/admin/discounts" element={<DiscountManagement />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Routes>
        </div>

        {/* ✅ Footer ALWAYS visible */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;