import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
};

export const learningPathService = {
  getAll: () => api.get('/paths'),
  getById: (id) => api.get(`/paths/${id}`),
  create: (data) => api.post('/paths', data),
  update: (id, data) => api.put(`/paths/${id}`, data),
  adaptiveUpdate: (id) => api.post(`/paths/${id}/update`),
};

export const noteService = {
  getByPath: (pathId) => api.get(`/notes/${pathId}`),
  create: (data) => api.post('/notes', data),
  update: (id, content) => api.put(`/notes/${id}`, { content }),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const bookmarkService = {
  getAll: () => api.get('/bookmarks'),
  create: (data) => api.post('/bookmarks', data),
  delete: (id) => api.delete(`/bookmarks/${id}`),
};

export const streakService = {
  get: () => api.get('/streaks'),
  update: () => api.post('/streaks/update'),
};

export const githubService = {
  verify: (githubLink) => api.post('/github/verify', { githubLink }),
};

export const quizService = {
  getByTopic: (topic) => api.get(`/quizzes/${topic}`),
  submit: (topic, score) => api.post('/quizzes/submit', { topic, score }),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export default api;
