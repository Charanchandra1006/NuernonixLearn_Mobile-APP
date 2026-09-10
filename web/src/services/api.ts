import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
});

export const getAdminDashboard = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data;
};

export const getFacultyStudents = async () => {
  const res = await api.get('/faculty/students');
  return res.data;
};
