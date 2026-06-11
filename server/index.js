import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import driverRoutes from "./routes/driver.js";
import restaurantRoutes from "./routes/restaurants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/restaurants", restaurantRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// In-memory driver location store { driverId: { lat, lng, updatedAt, orderId } }
const driverLocations = new Map();

app.put("/api/driver/location", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("token-")) return res.sendStatus(401);
  const driverId = Number(auth.split("token-")[1]);
  const { lat, lng, orderId } = req.body;
  if (lat == null || lng == null) return res.status(400).json({ error: "lat and lng required" });
  driverLocations.set(driverId, { lat, lng, orderId, updatedAt: new Date().toISOString() });
  res.json({ ok: true });
});

app.get("/api/driver/location/:driverId", (req, res) => {
  const loc = driverLocations.get(Number(req.params.driverId));
  res.json(loc || null);
});

app.get("/api/orders/:id/driver-location", async (req, res) => {
  try {
    const { readFile } = await import("node:fs/promises");
    const ORDERS_PATH = new URL("./data/orders.json", import.meta.url);
    const data = await readFile(ORDERS_PATH, "utf-8");
    const orders = JSON.parse(data);
    const order = orders.find((o) => o.id === Number(req.params.id));
    if (!order || !order.driverId) return res.json(null);
    const loc = driverLocations.get(order.driverId);
    res.json(loc || null);
  } catch {
    res.json(null);
  }
});

const distDir = path.resolve(__dirname, "..", "dist");

const apps = [
  { route: "/customer", dir: "customer", assets: "customer" },
  { route: "/admin", dir: "admin", assets: "admin" },
  { route: "/driver", dir: "driver", assets: "driver" },
];

for (const { route, dir } of apps) {
  app.use(route, express.static(path.join(distDir, dir)));
  app.get(`${route}/*`, (_req, res) => {
    res.sendFile(path.join(distDir, dir, "index.html"));
  });
}

app.use("/assets", express.static(path.join(distDir, "customer", "assets")));
app.use("/assets", express.static(path.join(distDir, "admin", "assets")));
app.use("/assets", express.static(path.join(distDir, "driver", "assets")));
app.use("/icons", express.static(path.join(distDir, "customer", "icons")));

app.get("/", (_req, res) => res.redirect("/customer/"));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "customer", "index.html"));
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`  Landing:  http://localhost:${PORT}/`);
  console.log(`  Customer: http://localhost:${PORT}/customer/`);
  console.log(`  Admin:    http://localhost:${PORT}/admin/`);
  console.log(`  Driver:   http://localhost:${PORT}/driver/`);
});
