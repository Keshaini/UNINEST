import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvoiceView from './components/payments/InvoiceView';
import PaymentForm from './components/payments/PaymentForm';
import PaymentSuccess from './components/payments/PaymentSuccess';
import PaymentHistory from './components/payments/PaymentHistory';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<InvoiceView />} />
          <Route path="/invoices" element={<InvoiceView />} />
          <Route path="/payment-form/:invoiceId" element={<PaymentForm />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;