import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Invoice APIs
export const getInvoices = async (studentId) => {
  try {
    const response = await api.get(`/invoices${studentId ? `?studentId=${studentId}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

export const getInvoiceById = async (id) => {
  try {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Payment APIs
export const processPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/process', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

export const getPayments = async (studentId) => {
  try {
    const response = await api.get(`/payments${studentId ? `?studentId=${studentId}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};

export default {
  getInvoices,
  getInvoiceById,
  createInvoice,
  processPayment,
  getPayments,
  getPaymentById
};