import { Router } from "express";
import { readFile } from "node:fs/promises";

const router = Router();
const RESTAURANTS_PATH = new URL("../data/restaurants.json", import.meta.url);

router.get("/", async (_req, res) => {
  try {
    const data = await readFile(RESTAURANTS_PATH, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await readFile(RESTAURANTS_PATH, "utf-8");
    const restaurants = JSON.parse(data);
    const r = restaurants.find((r) => r.id === Number(req.params.id));
    if (!r) return res.status(404).json({ error: "Restaurant not found" });
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
