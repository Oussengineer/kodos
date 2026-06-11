import client from "./client";

export const getRestaurants = () =>
  client.get("/restaurants").then((r) => r.data);

export const getRestaurant = (id) =>
  client.get(`/restaurants/${id}`).then((r) => r.data);
