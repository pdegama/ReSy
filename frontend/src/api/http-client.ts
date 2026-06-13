import axios from 'axios';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? error.message ?? 'Request failed';
    return Promise.reject(new Error(message));
  },
);

