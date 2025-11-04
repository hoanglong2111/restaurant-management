// client/src/components/axiosInstance.js
import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Add a request interceptor to include authentication headers only when available
axiosInstance.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle token errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // If we get a 401 error with invalid token message, clear localStorage and redirect to login
        if (error.response && error.response.status === 401) {
            const message = error.response.data?.message || '';
            if (message.includes('Invalid token') || message.includes('token failed')) {
                console.log('Token is invalid or expired. Clearing localStorage and redirecting to login...');
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;