import { create } from "zustand";

const prefix = import.meta.env.VITE_APP || "customer";

const loadUser = () => {
  try { return JSON.parse(localStorage.getItem(`${prefix}_user`) || "null"); } catch { return null; }
};

export const useAuthStore = create((set) => ({
  user: loadUser(),
  token: localStorage.getItem(`${prefix}_token`) || null,
  isAuthenticated: !!localStorage.getItem(`${prefix}_token`),
  setAuth: (user, token) => {
    localStorage.setItem(`${prefix}_user`, JSON.stringify(user));
    localStorage.setItem(`${prefix}_token`, token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem(`${prefix}_user`);
    localStorage.removeItem(`${prefix}_token`);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
