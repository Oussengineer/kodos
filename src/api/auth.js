import client from "./client";

export const login = (email, password) =>
  client.post("/auth/login", { email, password }).then((r) => r.data);

export const register = (name, email, password, phone) =>
  client.post("/auth/register", { name, email, password, phone }).then((r) => r.data);
