import { Router } from "express";
import { readFile, writeFile } from "node:fs/promises";
import { notifyNewOrder } from "../utils/push.js";

const router = Router();
const ORDERS_PATH = new URL("../data/orders.json", import.meta.url);
const USERS_PATH = new URL("../data/users.json", import.meta.url);
const RESTAURANTS_PATH = new URL("../data/restaurants.json", import.meta.url);

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getOrders() {
  try {
    const data = await readFile(ORDERS_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("token-")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = Number(authHeader.split("token-")[1]);
  next();
}

router.post("/", auth, async (req, res) => {
  try {
    const orders = await getOrders();
    const { items, address, total, latitude, longitude } = req.body;

    let deliveryFee = 0;
    if (items && items.length > 0 && latitude != null && longitude != null) {
      const restaurants = JSON.parse(await readFile(RESTAURANTS_PATH, "utf-8"));
      const restaurantId = items[0].restaurantId;
      const restaurant = restaurants.find((r) => r.id === restaurantId);
      if (restaurant && restaurant.latitude != null && restaurant.longitude != null) {
        const dist = haversineKm(
          latitude, longitude,
          restaurant.latitude, restaurant.longitude
        );
        deliveryFee = Math.round(dist);
      }
    }

    const finalTotal = total + deliveryFee;
    const order = {
      id: Date.now(),
      userId: req.userId,
      items,
      address,
      total: finalTotal,
      deliveryFee,
      latitude: latitude || null,
      longitude: longitude || null,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    await writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2));
    notifyNewOrder(order).catch(() => {});
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const orders = await getOrders();
    const userOrders = orders.filter((o) => o.userId === req.userId);
    res.json(userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const orders = await getOrders();
    const order = orders.find((o) => o.id === Number(req.params.id) && o.userId === req.userId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.driverId) {
      const users = JSON.parse(await readFile(USERS_PATH, "utf-8"));
      const driver = users.find((u) => u.id === order.driverId);
      if (driver) {
        order.driverName = driver.name;
        order.driverPhone = driver.phone || "";
      }
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
