import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: සෑම Request එකකටම Authorization Header එක එකතු කිරීම
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken'); // Local Storage වෙතින් token එක ලබා ගැනීම
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
