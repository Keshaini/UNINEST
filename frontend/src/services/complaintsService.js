import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/complaints';

const complaintsApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

// Add token to requests
complaintsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const isNotFound = (error) => error?.response?.status === 404;

const requestWithFallback = async (primaryRequest, fallbackRequest) => {
  try {
    return await primaryRequest();
  } catch (error) {
    if (!isNotFound(error) || !fallbackRequest) {
      throw error;
    }

    return fallbackRequest();
  }
};

export const createComplaint = async (payload) => {
  const response = await requestWithFallback(
    () => complaintsApi.post('/student/submit', payload),
    () => complaintsApi.post('/', payload)
  );
  return response.data;
};

export const getComplaints = async (params = {}) => {
  const response = await requestWithFallback(
    () => complaintsApi.get('/support/all', { params }),
    () => complaintsApi.get('/', { params })
  );
  return response.data;
};

export const getComplaintsByStudent = async (studentId, params = {}) => {
  const encodedId = encodeURIComponent(studentId);
  const response = await requestWithFallback(
    () => complaintsApi.get(`/student/history/${encodedId}`, { params }),
    () => complaintsApi.get(`/student/${encodedId}`, { params })
  );
  return response.data;
};

export const updateComplaint = async (id, payload) => {
  const response = await requestWithFallback(
    () => complaintsApi.patch(`/support/update/${id}`, payload),
    () => complaintsApi.patch(`/${id}`, payload)
  );
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await requestWithFallback(
    () => complaintsApi.delete(`/support/remove/${id}`),
    () => complaintsApi.delete(`/${id}`)
  );
  return response.data;
};

export const getComplaintStats = async () => {
  const response = await requestWithFallback(
    () => complaintsApi.get('/support/overview-stats'),
    () => complaintsApi.get('/stats/overview')
  );
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await requestWithFallback(
    () => complaintsApi.get(`/record/${id}`),
    () => complaintsApi.get(`/${id}`)
  );
  return response.data;
};

export const getStudentTicketDetails = async (ticketId, studentId) => {
  const encodedStudentId = encodeURIComponent(studentId);
  const response = await complaintsApi.get(`/student/ticket/${ticketId}/full-view/${encodedStudentId}`);
  return response.data;
};

export const getSupportTicketDetails = async (ticketId) => {
  const response = await complaintsApi.get(`/support/ticket/${ticketId}/full-view`);
  return response.data;
};

export const getStudentTicketMessages = async (ticketId, studentId) => {
  const encodedStudentId = encodeURIComponent(studentId);
  const response = await complaintsApi.get(`/student/ticket/${ticketId}/messages/${encodedStudentId}`);
  return response.data;
};

export const getSupportTicketMessages = async (ticketId) => {
  const response = await complaintsApi.get(`/support/ticket/${ticketId}/messages`);
  return response.data;
};

export const sendStudentTicketMessage = async (ticketId, studentId, payload) => {
  const encodedStudentId = encodeURIComponent(studentId);
  const response = await complaintsApi.post(`/student/ticket/${ticketId}/messages/${encodedStudentId}/send`, payload);
  return response.data;
};

export const sendSupportTicketMessage = async (ticketId, payload) => {
  const response = await complaintsApi.post(`/support/ticket/${ticketId}/messages/send`, payload);
  return response.data;
};
