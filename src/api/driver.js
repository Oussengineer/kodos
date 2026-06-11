import client from "./client";

export const getAvailableOrders = () =>
  client.get("/driver/orders/available").then((r) => r.data);

export const getActiveDeliveries = () =>
  client.get("/driver/orders/active").then((r) => r.data);

export const getDeliveryHistory = () =>
  client.get("/driver/orders/history").then((r) => r.data);

export const acceptOrder = (id) =>
  client.post(`/driver/orders/${id}/accept`).then((r) => r.data);

export const updateDeliveryStatus = (id, status) =>
  client.patch(`/driver/orders/${id}/status`, { status }).then((r) => r.data);

export const updateDriverLocation = (lat, lng, orderId) =>
  client.put("/driver/location", { lat, lng, orderId }).then((r) => r.data);
