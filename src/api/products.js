import client from "./client";

export const getProducts = (params = {}) =>
  client.get("/products", { params }).then((r) => r.data);

export const getCategories = () =>
  client.get("/products/categories").then((r) => r.data);

export const getProduct = (id) =>
  client.get(`/products/${id}`).then((r) => r.data);
