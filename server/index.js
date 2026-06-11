import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import driverRoutes from "./routes/driver.js";

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

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

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

app.use(express.static(distDir));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`  Landing:  http://localhost:${PORT}/`);
  console.log(`  Customer: http://localhost:${PORT}/customer/`);
  console.log(`  Admin:    http://localhost:${PORT}/admin/`);
  console.log(`  Driver:   http://localhost:${PORT}/driver/`);
});
