import axios from 'axios';

// ⚠️ API URL එක .env ගොනුවකින් (NEXT_PUBLIC_API_BASE_URL) ලබා ගැනීම වඩාත් සුදුසුය.
// Local development සඳහා පමණක් fallback එකක් භාවිතා කරයි.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 🔑 Interceptor: සියලුම Request සඳහා JWT Token එක Header එකට එක් කිරීම
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
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
