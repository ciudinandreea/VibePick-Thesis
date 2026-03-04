import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const register = async (fullName, email, password) => {
  const response = await api.post('/auth/register', { fullName, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  const user = getCurrentUser();
  const uid  = user?.id || user?.userId || '';
  if (uid) {
    localStorage.removeItem(`setupComplete_${uid}`);
    localStorage.removeItem(`moodDate_${uid}`);
    localStorage.removeItem(`currentMood_${uid}`);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('currentMood');
  localStorage.removeItem('moodDate');
  localStorage.removeItem('setupComplete');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => !!localStorage.getItem('token');

export default api;
