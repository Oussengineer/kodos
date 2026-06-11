import { Router } from "express";
import { readFile, writeFile } from "node:fs/promises";

const router = Router();
const ORDERS_PATH = new URL("../data/orders.json", import.meta.url);
const USERS_PATH = new URL("../data/users.json", import.meta.url);

async function getJSON(path) {
  try {
    return JSON.parse(await readFile(path, "utf-8"));
  } catch {
    return [];
  }
}

function driverAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("token-")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = Number(authHeader.split("token-")[1]);
  getJSON(USERS_PATH).then((users) => {
    const user = users.find((u) => u.id === userId);
    if (!user || user.role !== "driver") {
      return res.status(403).json({ error: "Driver access required" });
    }
    req.userId = userId;
    req.user = user;
    next();
  }).catch(() => res.status(500).json({ error: "Server error" }));
}

router.get("/orders/available", driverAuth, async (_req, res) => {
  try {
    const orders = await getJSON(ORDERS_PATH);
    const users = await getJSON(USERS_PATH);
    const available = orders.filter(
      (o) => !o.driverId && (o.status === "confirmed" || o.status === "preparing")
    );
    const enriched = available.map((o) => {
      const u = users.find((user) => user.id === o.userId);
      return { ...o, customerName: u?.name || "Unknown", customerPhone: u?.phone || "" };
    });
    res.json(enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/orders/active", driverAuth, async (req, res) => {
  try {
    const orders = await getJSON(ORDERS_PATH);
    const users = await getJSON(USERS_PATH);
    const active = orders.filter(
      (o) => o.driverId === req.userId && o.status !== "delivered"
    );
    const enriched = active.map((o) => {
      const u = users.find((user) => user.id === o.userId);
      return { ...o, customerName: u?.name || "Unknown", customerPhone: u?.phone || "" };
    });
    res.json(enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/orders/history", driverAuth, async (req, res) => {
  try {
    const orders = await getJSON(ORDERS_PATH);
    const users = await getJSON(USERS_PATH);
    const history = orders.filter(
      (o) => o.driverId === req.userId && o.status === "delivered"
    );
    const enriched = history.map((o) => {
      const u = users.find((user) => user.id === o.userId);
      return { ...o, customerName: u?.name || "Unknown", customerPhone: u?.phone || "" };
    });
    res.json(enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/orders/:id/accept", driverAuth, async (req, res) => {
  try {
    const orders = await getJSON(ORDERS_PATH);
    const idx = orders.findIndex((o) => o.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Order not found" });
    if (orders[idx].driverId) {
      return res.status(409).json({ error: "Order already accepted by another driver" });
    }
    orders[idx].driverId = req.userId;
    orders[idx].status = "out_for_delivery";
    orders[idx].acceptedAt = new Date().toISOString();
    await writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2));
    res.json(orders[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/orders/:id/status", driverAuth, async (req, res) => {
  try {
    const orders = await getJSON(ORDERS_PATH);
    const idx = orders.findIndex(
      (o) => o.id === Number(req.params.id) && o.driverId === req.userId
    );
    if (idx === -1) return res.status(404).json({ error: "Order not found or not assigned to you" });
    const validTransitions = { out_for_delivery: "delivered" };
    const newStatus = req.body.status;
    if (validTransitions[orders[idx].status] !== newStatus) {
      return res.status(400).json({ error: `Cannot transition from ${orders[idx].status} to ${newStatus}` });
    }
    orders[idx].status = newStatus;
    orders[idx].deliveredAt = new Date().toISOString();
    await writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2));
    res.json(orders[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/profile", driverAuth, async (req, res) => {
  res.json(req.user);
});

export default router;
