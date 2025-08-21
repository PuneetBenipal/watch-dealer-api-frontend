import axios from "axios"
import { BACKEND_URL } from "../config";

const API = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
})

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't override Content-Type for FormData
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle errors
// API.interceptors.response.use(
//     (response) => response,
//     (error) => { Promise.reject(error) }
// );   

export default API;

