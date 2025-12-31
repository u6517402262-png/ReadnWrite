import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers if available
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

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }) => api.post('/auth/register', data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// Parties API
export const partiesAPI = {
  create: (data: { name: string; description?: string }) =>
    api.post('/parties', data),

  getAll: () => api.get('/parties'),

  getById: (id: string) => api.get(`/parties/${id}`),

  addMember: (partyId: string, data: { userId: string; role?: string }) =>
    api.post(`/parties/${partyId}/members`, data),
};

// Documents API
export const documentsAPI = {
  create: (data: { title: string; content: string; partyId: string }) =>
    api.post('/documents', data),

  getByParty: (partyId: string) =>
    api.get(`/documents/party/${partyId}`),

  getById: (id: string) => api.get(`/documents/${id}`),

  update: (
    id: string,
    data: { title?: string; content?: string; status?: string }
  ) => api.put(`/documents/${id}`, data),

  delete: (id: string) => api.delete(`/documents/${id}`),
};

export default api;
