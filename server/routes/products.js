import { Router } from "express";
import { readFile } from "node:fs/promises";

const router = Router();
const PRODUCTS_PATH = new URL("../data/products.json", import.meta.url);

router.get("/", async (req, res) => {
  try {
    const data = await readFile(PRODUCTS_PATH, "utf-8");
    const products = JSON.parse(data);
    const { category } = req.query;
    if (category) {
      return res.json(products.filter((p) => p.category.toLowerCase() === category.toLowerCase()));
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const data = await readFile(PRODUCTS_PATH, "utf-8");
    const products = JSON.parse(data);
    const categories = [...new Set(products.map((p) => p.category))];
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await readFile(PRODUCTS_PATH, "utf-8");
    const products = JSON.parse(data);
    const product = products.find((p) => p.id === Number(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
