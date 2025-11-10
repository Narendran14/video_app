import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true // if using cookies for auth
});

// Add auth token from localStorage (if you use localStorage)
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
