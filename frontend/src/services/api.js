import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Optional: Add interceptors if needed globally
// api.interceptors.request.use((config) => {
//   // e.g., attach token from localStorage if not using cookies
//   const user = JSON.parse(localStorage.getItem('ganpatiUser'));
//   if (user && user.token) {
//     config.headers.Authorization = `Bearer ${user.token}`;
//   }
//   return config;
// });

export default api;
