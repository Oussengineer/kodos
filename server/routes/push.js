import { Router } from "express";
import { addSubscription, removeSubscription, getVapidPublicKey } from "../utils/push.js";
import { readFile } from "node:fs/promises";

const router = Router();
const USERS_PATH = new URL("../data/users.json", import.meta.url);

async function getUser(userId) {
  try {
    const users = JSON.parse(await readFile(USERS_PATH, "utf-8"));
    return users.find((u) => u.id === userId) || null;
  } catch {
    return null;
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

router.get("/vapid-key", (_req, res) => {
  res.json({ publicKey: getVapidPublicKey() });
});

router.post("/subscribe", auth, async (req, res) => {
  try {
    const user = await getUser(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { endpoint, keys, platform } = req.body;
    if (!endpoint) return res.status(400).json({ error: "endpoint required" });
    await addSubscription({
      userId: req.userId,
      role: user.role,
      endpoint,
      keys: keys || {},
      platform: platform || "web",
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/subscribe", auth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: "endpoint required" });
    await removeSubscription(endpoint);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;