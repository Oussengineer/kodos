import { Router } from "express";
import { readFile, writeFile } from "node:fs/promises";

const router = Router();
const ORDERS_PATH = new URL("../data/orders.json", import.meta.url);

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
    const order = {
      id: Date.now(),
      userId: req.userId,
      items,
      address,
      total,
      latitude: latitude || null,
      longitude: longitude || null,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    await writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2));
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
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
