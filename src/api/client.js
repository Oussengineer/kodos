import axios from "axios";

const prefix = import.meta.env.VITE_APP || "customer";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://kodos.onrender.com/api" : "http://localhost:3001/api"),
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(`${prefix}_token`);
  if (token) config.headers.Authorization = token;
  return config;
});

export default client;
