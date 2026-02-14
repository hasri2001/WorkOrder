import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
};

// Work Order endpoints
export const workOrderAPI = {
  getAll: (params) => api.get('/work-orders', { params }),
  getOne: (id) => api.get(`/work-orders/${id}`),
  create: (data) => api.post('/work-orders', data),
  update: (id, data) => api.patch(`/work-orders/${id}`, data),
  updateStatus: (id, newStatus) => api.patch(`/work-orders/${id}/status`, { newStatus }),
  delete: (id) => api.delete(`/work-orders/${id}`),
  getLogs: (id) => api.get(`/work-orders/${id}/logs`),
};

// User endpoints
export const userAPI = {
  create: (data) => api.post('/users', data),
};

export default api;
