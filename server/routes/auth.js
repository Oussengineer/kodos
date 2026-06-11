import { Router } from "express";
import { readFile, writeFile } from "node:fs/promises";

const router = Router();
const USERS_PATH = new URL("../data/users.json", import.meta.url);

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password required" });
    }
    const data = await readFile(USERS_PATH, "utf-8");
    const users = JSON.parse(data);
    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const user = { id: Date.now(), name, email, password, phone, role: "user" };
    users.push(user);
    await writeFile(USERS_PATH, JSON.stringify(users, null, 2));
    const { password: _, ...safe } = user;
    res.status(201).json({ user: safe, token: `token-${user.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register/driver", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password required" });
    }
    const data = await readFile(USERS_PATH, "utf-8");
    const users = JSON.parse(data);
    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const user = { id: Date.now(), name, email, password, phone, role: "driver" };
    users.push(user);
    await writeFile(USERS_PATH, JSON.stringify(users, null, 2));
    const { password: _, ...safe } = user;
    res.status(201).json({ user: safe, token: `token-${user.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await readFile(USERS_PATH, "utf-8");
    const users = JSON.parse(data);
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const { password: _, ...safe } = user;
    res.json({ user: safe, token: `token-${user.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
