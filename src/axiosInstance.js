// axiosInstance.js
import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: "https://85hh51r8-4000.inc1.devtunnels.ms/api",
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Optional: keep minimal error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not reachable');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
