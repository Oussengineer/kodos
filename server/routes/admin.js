import { Router } from "express";
import { readFile, writeFile } from "node:fs/promises";

const router = Router();
const ORDERS_PATH = new URL("../data/orders.json", import.meta.url);
const PRODUCTS_PATH = new URL("../data/products.json", import.meta.url);
const USERS_PATH = new URL("../data/users.json", import.meta.url);

async function getJSON(path) {
  try {
    return JSON.parse(await readFile(path, "utf-8"));
  } catch {
    return [];
  }
}

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("token-")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = Number(authHeader.split("token-")[1]);
  getJSON(USERS_PATH).then((users) => {
    const user = users.find((u) => u.id === userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.userId = userId;
    next();
  }).catch(() => res.status(500).json({ error: "Server error" }));
}

router.get("/stats", adminAuth, async (_req, res) => {
  try {
    const orders = await getJSON(ORDERS_PATH);
    const products = await getJSON(PRODUCTS_PATH);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const preparingOrders = orders.filter((o) => o.status === "preparing").length;
    const outForDelivery = orders.filter((o) => o.status === "out_for_delivery").length;
    const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
    const totalProducts = products.length;
    res.json({ totalOrders, totalRevenue, pendingOrders, preparingOrders, outForDelivery, deliveredOrders, totalProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/orders", adminAuth, async (_req, res) => {
  try {
    const orders = await getJSON(ORDERS_PATH);
    const users = await getJSON(USERS_PATH);
    const enriched = orders.map((o) => {
      const u = users.find((u) => u.id === o.userId);
      return { ...o, customerName: u?.name || "Unknown" };
    });
    res.json(enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const orders = await getJSON(ORDERS_PATH);
    const idx = orders.findIndex((o) => o.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Order not found" });
    orders[idx].status = req.body.status;
    await writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2));
    res.json(orders[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/products", adminAuth, async (_req, res) => {
  try {
    const products = await getJSON(PRODUCTS_PATH);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/products", adminAuth, async (req, res) => {
  try {
    const products = await getJSON(PRODUCTS_PATH);
    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
    const product = { id: maxId + 1, ...req.body };
    products.push(product);
    await writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2));
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/products/:id", adminAuth, async (req, res) => {
  try {
    const products = await getJSON(PRODUCTS_PATH);
    const idx = products.findIndex((p) => p.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Product not found" });
    products[idx] = { ...products[idx], ...req.body };
    await writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2));
    res.json(products[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/products/:id", adminAuth, async (req, res) => {
  try {
    const products = await getJSON(PRODUCTS_PATH);
    const idx = products.findIndex((p) => p.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Product not found" });
    const [deleted] = products.splice(idx, 1);
    await writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2));
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
