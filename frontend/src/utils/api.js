import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ Base URL should not have "/api/api"
  headers: { "Content-Type": "application/json" },
});

// Attach token to requests automatically
api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default api;