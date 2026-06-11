import client from "./client";

export const placeOrder = (order) =>
  client.post("/orders", order).then((r) => r.data);

export const getOrders = () =>
  client.get("/orders").then((r) => r.data);

export const getOrder = (id) =>
  client.get(`/orders/${id}`).then((r) => r.data);

export const getDriverLocation = (orderId) =>
  client.get(`/orders/${orderId}/driver-location`).then((r) => r.data)

export const postReview = (productId, { rating, comment, userName }) =>
  client.post(`/products/${productId}/reviews`, { rating, comment, userName }).then((r) => r.data);
