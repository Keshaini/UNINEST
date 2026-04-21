import axios from 'axios';

const DEFAULT_COMPLAINTS_API_URL = 'http://localhost:5000/api/complaints';

const normalizePathname = (pathname = '') => pathname.replace(/\/+$/, '');

const resolveComplaintsApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!configuredBaseUrl) return DEFAULT_COMPLAINTS_API_URL;

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const resolvedUrl = new URL(configuredBaseUrl, origin);
    const normalizedPath = normalizePathname(resolvedUrl.pathname);

    if (normalizedPath.endsWith('/complaints')) {
      resolvedUrl.pathname = normalizedPath;
      return resolvedUrl.toString().replace(/\/$/, '');
    }

    if (normalizedPath.endsWith('/api')) {
      resolvedUrl.pathname = `${normalizedPath}/complaints`;
      return resolvedUrl.toString().replace(/\/$/, '');
    }

    resolvedUrl.pathname = `${normalizedPath || ''}/api/complaints`;
    return resolvedUrl.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_COMPLAINTS_API_URL;
  }
};

const apiBaseUrl = resolveComplaintsApiBaseUrl();
const complaintsAssetBaseUrl = (() => {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return 'http://localhost:5000';
  }
})();

const complaintsApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

// Add token to requests
complaintsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
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

const isFormDataPayload = (payload) => typeof FormData !== 'undefined' && payload instanceof FormData;

const buildRequestConfig = (payload) => (isFormDataPayload(payload) ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});

export const resolveComplaintAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath) || assetPath.startsWith('data:') || assetPath.startsWith('blob:')) {
    return assetPath;
  }

  try {
    return new URL(assetPath, complaintsAssetBaseUrl).toString();
  } catch {
    return assetPath;
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
  const response = await complaintsApi.post(
    `/student/ticket/${ticketId}/messages/${encodedStudentId}/send`,
    payload,
    buildRequestConfig(payload)
  );
  return response.data;
};

export const sendSupportTicketMessage = async (ticketId, payload) => {
  const response = await complaintsApi.post(`/support/ticket/${ticketId}/messages/send`, payload, buildRequestConfig(payload));
  return response.data;
};
