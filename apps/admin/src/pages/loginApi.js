import client from "../api/client";

export const login = (email, password) =>
  client.post("/auth/login", { email, password }).then((r) => r.data);
