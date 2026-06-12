import axios from "axios";

const prefix = import.meta.env.VITE_APP || "customer";

function getTabId() {
  let id = sessionStorage.getItem(`${prefix}_tid`);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(`${prefix}_tid`, id); }
  return id;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://kodos.onrender.com/api" : "http://localhost:3001/api"),
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(`${prefix}_token_${getTabId()}`);
  if (token) config.headers.Authorization = token;
  return config;
});

export default client;
