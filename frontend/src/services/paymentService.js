import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests (when available)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== INVOICE SERVICES ==========

export const getInvoices = async () => {
  const response = await api.get('/invoice'); 
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await api.get(`/invoice/${id}`);
  return response.data;
};

export const createInvoice = async (invoiceData) => {
  const response = await api.post('/admin/invoices', invoiceData);
  return response.data;
};

export const updateInvoice = async (id, updates) => {
  const response = await api.put(`/invoice/${id}`, updates);
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await api.delete(`/invoice/${id}`);
  return response.data;
};

// ========== PAYMENT SERVICES ==========

export const processPayment = async (data) => {
  return {
    data: {
      payment: { id: "PAY123", status: "success" },
      invoice: data
    }
  };
};

export const getPayments = async (params = {}) => {
  const response = await api.get('/payments', { params });
  return response.data;
};

export const getPaymentByReceipt = async (receiptNumber) => {
  const response = await api.get(`/payments/receipt/${receiptNumber}`);
  return response.data;
};

// ========== REFUND SERVICES ==========

export const requestRefund = async (refundData) => {
  const response = await api.post('/refunds', refundData);
  return response.data;
};

export const getRefunds = async (params = {}) => {
  const response = await api.get('/refunds', { params });
  return response.data;
};

export const getRefundById = async (id) => {
  const response = await api.get(`/refunds/${id}`);
  return response.data;
};

export const processRefund = async (id, data) => {
  const response = await api.put(`/refunds/${id}/process`, data);
  return response.data;
};

// ========== BANK TRANSFER SERVICES ==========

export const submitBankTransfer = async (formData) => {
  const response = await api.post('/bank-transfer', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getBankTransferStatus = async (paymentId) => {
  const response = await api.get(`/bank-transfer/${paymentId}/status`);
  return response.data;
};

// ========== NOTIFICATION SERVICES ==========

export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.put('/notifications/mark-all-read');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

// ========== ADMIN SERVICES ==========

export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getPendingVerifications = async () => {
  try {
    const response = await api.get('/admin/verifications/pending');
    return response.data;
  } catch (error) {
    console.warn("⚠️ Backend not available → using mock data");

    // ✅ MOCK DATA (temporary)
    return {
      data: [
        {
          _id: "1",
          paymentId: { _id: "PAY001", amount: 25000 },
          invoiceId: {
            invoiceNumber: "INV-001",
            studentName: "Kamal Perera",
            studentId: "IT20231234"
          },
          bankTransferDetails: {
            bankName: "BOC",
            transactionReference: "TRX123456",
            transferDate: new Date(),
            receiptImage: ""
          }
        }
      ]
    };
  }
};

export const verifyBankTransfer = async (id, data) => {
  const response = await api.put(`/admin/verifications/${id}`, data);
  return response.data;
};

export const createDiscount = async (discountData) => {
  const response = await api.post('/admin/discounts', discountData);
  return response.data;
};

export const getDiscounts = async (params = {}) => {
  const response = await api.get('/admin/discounts', { params });
  return response.data;
};

export const updateDiscountStatus = async (id, status) => {
  const response = await api.put(`/admin/discounts/${id}/status`, { status });
  return response.data;
};

// ========== REPORT SERVICES ==========

export const getFinancialSummary = async (params = {}) => {
  const response = await api.get('/reports/financial-summary', { params });
  return response.data;
};

export const getPaymentAnalytics = async () => {
  const response = await api.get('/reports/analytics');
  return response.data;
};

export const exportPayments = async (params = {}) => {
  const response = await api.get('/reports/export/payments', {
    params,
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `payments-${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportInvoices = async (params = {}) => {
  const response = await api.get('/reports/export/invoices', {
    params,
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `invoices-${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default api;