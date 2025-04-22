import axios from "axios";

const api = axios.create({
  baseURL: "http://54.167.85.71/:5000/api", // ✅ Use public EC2 IP here
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default api;
