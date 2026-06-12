import { create } from "zustand";

const prefix = import.meta.env.VITE_APP || "customer";

function getTabId() {
  let id = sessionStorage.getItem(`${prefix}_tid`);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(`${prefix}_tid`, id); }
  return id;
}

const tabId = getTabId();

const userKey = () => `${prefix}_user_${tabId}`;
const tokenKey = () => `${prefix}_token_${tabId}`;

const loadUser = () => {
  try { return JSON.parse(localStorage.getItem(userKey()) || "null"); } catch { return null; }
};

export const useAuthStore = create((set) => ({
  user: loadUser(),
  token: localStorage.getItem(tokenKey()) || null,
  isAuthenticated: !!localStorage.getItem(tokenKey()),
  setAuth: (user, token) => {
    localStorage.setItem(userKey(), JSON.stringify(user));
    localStorage.setItem(tokenKey(), token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem(userKey());
    localStorage.removeItem(tokenKey());
    sessionStorage.removeItem(`${prefix}_tid`);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
