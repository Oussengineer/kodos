import client from "./client";

export const getStats = () =>
  client.get("/admin/stats").then((r) => r.data);

export const getAllOrders = () =>
  client.get("/admin/orders").then((r) => r.data);

export const updateOrderStatus = (id, status) =>
  client.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data);

export const getAdminProducts = () =>
  client.get("/admin/products").then((r) => r.data);

export const createProduct = (product) =>
  client.post("/admin/products", product).then((r) => r.data);

export const updateProduct = (id, product) =>
  client.put(`/admin/products/${id}`, product).then((r) => r.data);

export const deleteProduct = (id) =>
  client.delete(`/admin/products/${id}`).then((r) => r.data);

export const getAdminRestaurants = () =>
  client.get("/admin/restaurants").then((r) => r.data);

export const createRestaurant = (data) =>
  client.post("/admin/restaurants", data).then((r) => r.data);

export const updateRestaurant = (id, data) =>
  client.put(`/admin/restaurants/${id}`, data).then((r) => r.data);

export const deleteRestaurant = (id) =>
  client.delete(`/admin/restaurants/${id}`).then((r) => r.data);
