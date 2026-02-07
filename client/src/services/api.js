import axios from 'axios';
import { API_BASE_URL } from '@/config/env';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        // specific logic for admin routes
        let token;
        if (config.url && config.url.includes('/admin')) {
            token = localStorage.getItem('adminToken');
        } else {
            token = localStorage.getItem('accessToken');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
