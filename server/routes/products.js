import { Router } from "express";
import { readFile, writeFile } from "node:fs/promises";

const router = Router();
const PRODUCTS_PATH = new URL("../data/products.json", import.meta.url);
const REVIEWS_PATH = new URL("../data/reviews.json", import.meta.url);

router.get("/", async (req, res) => {
  try {
    const data = await readFile(PRODUCTS_PATH, "utf-8");
    const products = JSON.parse(data);
    const reviewsData = await readFile(REVIEWS_PATH, "utf-8").catch(() => "[]");
    const allReviews = JSON.parse(reviewsData);
    const { category, restaurantId, type } = req.query;
    let filtered = products;
    if (category) filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    if (restaurantId) filtered = filtered.filter((p) => p.restaurantId === Number(restaurantId));
    if (type) filtered = filtered.filter((p) => p.type === type);
    const withRatings = filtered.map((p) => {
      const productReviews = allReviews.filter((r) => r.productId === p.id);
      const avgRating = productReviews.length
        ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
        : p.rating;
      return { ...p, avgRating, reviewCount: productReviews.length };
    });
    res.json(withRatings);
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
    // attach average rating
    const reviewsData = await readFile(REVIEWS_PATH, "utf-8").catch(() => "[]");
    const allReviews = JSON.parse(reviewsData);
    const productReviews = allReviews.filter((r) => r.productId === product.id);
    const avgRating = productReviews.length
      ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
      : product.rating;
    res.json({ ...product, avgRating, reviewCount: productReviews.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const data = await readFile(REVIEWS_PATH, "utf-8").catch(() => "[]");
    const reviews = JSON.parse(data);
    res.json(reviews.filter((r) => r.productId === Number(req.params.id)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/reviews", async (req, res) => {
  try {
    const { rating, comment, userName } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    const data = await readFile(REVIEWS_PATH, "utf-8").catch(() => "[]");
    const reviews = JSON.parse(data);
    const review = {
      id: Date.now(),
      productId: Number(req.params.id),
      rating,
      comment: comment || "",
      userName: userName || "Anonymous",
      createdAt: new Date().toISOString(),
    };
    reviews.push(review);
    await writeFile(REVIEWS_PATH, JSON.stringify(reviews, null, 2));
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
